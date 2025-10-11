import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar drag & drop
 * @param {Array} items - Array de elementos a reordenar
 * @param {Function} onReorder - Función callback cuando se reordena
 * @returns {Object} - Funciones y estados para drag & drop
 */
export const useDragAndDrop = (items, onReorder) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e, itemId) => {
    setDraggedItem(itemId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    // Agregar clase al body para indicar que se está arrastrando
    document.body.classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setIsDragging(false);
    document.body.classList.remove('dragging');
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem && dropIndex !== null) {
      const draggedIndex = items.findIndex(item => item.id === draggedItem);
      
      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        const newItems = [...items];
        const draggedItemData = newItems.splice(draggedIndex, 1)[0];
        newItems.splice(dropIndex, 0, draggedItemData);
        
        // Actualizar posiciones
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));
        
        onReorder(updatedItems);
      }
    }
    
    handleDragEnd();
  }, [draggedItem, dropIndex, items, onReorder, handleDragEnd]);

  const getDragProps = useCallback((itemId, index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, itemId),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
    style: {
      opacity: draggedItem === itemId ? 0.5 : 1,
      transform: dragOverIndex === index ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.2s ease'
    }
  }), [draggedItem, dragOverIndex, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop]);

  return {
    draggedItem,
    dragOverIndex,
    isDragging,
    getDragProps,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};

export default useDragAndDrop;
