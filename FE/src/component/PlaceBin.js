import { useDroppable } from '@dnd-kit/core';
import { GoTrash } from 'react-icons/go';
import './PlaceBin.css';
import classNames from 'classnames';

export default function PlaceBin({ isActive }) {
  const { setNodeRef } = useDroppable({
    id: 'place-bin',
  });

  const classes = classNames('PlaceBin', {
    ActivePlaceBin: isActive,
  });

  return (
    <div className={classes} ref={setNodeRef}>
      <GoTrash size="70%" color="#B0B0B0" />
    </div>
  );
}
