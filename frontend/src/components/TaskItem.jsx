import { useState } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (!title.trim() || title.trim() === task.title) {
      setEditing(false);
      setTitle(task.title);
      return;
    }
    setLoading(true);
    try {
      await onEdit(task.id, title.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEdit();
    if (e.key === 'Escape') {
      setEditing(false);
      setTitle(task.title);
    }
  };

  return (
    <li className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={!!task.completed}
        onChange={() => onToggle(task.id, !task.completed)}
        className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
      />

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 border-b border-indigo-400 outline-none text-sm py-0.5"
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
          onDoubleClick={() => setEditing(true)}
          title="Doble clic para editar"
        >
          {task.title}
        </span>
      )}

      <div className="flex gap-1 flex-shrink-0">
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
            title="Editar"
          >
            ✏️
          </button>
        )}
        {loading ? (
          <span className="text-xs text-gray-400 p-1">...</span>
        ) : (
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Eliminar"
          >
            🗑️
          </button>
        )}
      </div>
    </li>
  );
}
