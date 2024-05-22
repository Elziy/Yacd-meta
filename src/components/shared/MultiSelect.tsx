import s from './MultiSelect.module.scss';
import { HiX } from 'react-icons/hi';
import Select from '~/components/shared/Select';
import React from 'react';
import Rule, { editRule } from '~/components/rules/Rule';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { VariableSizeList } from 'react-window';
import useRemainingViewPortHeight from '~/hooks/useRemainingViewPortHeight';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';

type Props = {
  options: Array<string[]>;
  selected: any[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRemove: React.MouseEventHandler<HTMLDivElement>;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function MultiSelect({ options, selected, onChange, onRemove, ...Props }: Props) {
  const [refSelectedContainer, containerHeight] = useRemainingViewPortHeight();

  const onDragEnd = (result: { destination: { index: number; }; source: { index: number; }; }) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }
    const [removed] = selected.splice(result.source.index, 1);
    selected.splice(result.destination.index, 0, removed);
  };

  return (
    <div>
      <div ref={refSelectedContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-groups">
            {(provided) => (
              <div  {...provided.droppableProps} ref={provided.innerRef}>
                   {selected.map((select: any, index: number) =>
                     <Draggable draggableId={`group-${index}`} index={index} key={index}>
                       {(provided) => (
                         <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}
                              style={{ display: 'flex', alignItems: 'center', marginBottom: 10, ...provided.draggableProps.style }}>
                           <div className={s.multiSelectLabel}>
                             <span style={{ width: '100%', textAlign: 'center' }}>{select}</span>
                           </div>
                           <div className={s.removeSelectedButton}
                                onClick={() => onRemove(select)}>
                             <HiX color={'var(--color-icon)'} size={18} />
                           </div>
                         </div>
                       )}
                     </Draggable>
                   )}
                     {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Select
        options={options}
        selected={''}
        onChange={onChange}
        {...Props}
      ></Select>
    </div>
  );
}
