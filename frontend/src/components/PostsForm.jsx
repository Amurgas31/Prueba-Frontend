// Componente de formulario dinámico (funciona para Crear y Editar).
import { useState, useEffect, useRef } from "react";

const PostsForm = ({
  initialData = {},
  onSubmit,
  submitting = false,
  onClose,
  users = [],
}) => {
  const [form, setForm] = useState(() => ({
    userId: "",
    title: "",
    body: "",
    ...initialData,
  }));

  const isEditing = !!initialData?.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (onSubmit) onSubmit(payload);
  };

  const overlayRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      if (onClose) onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-teal-600">
              {isEditing ? "Editar Publicación" : "Nuevo Publicación"}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Formulario oficial de registro
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Formulario con Sistema Grid */}
        <form
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {/* CASO A: Campo que ocupa TODO EL ANCHO (sm:col-span-2) */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">
              Título
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Camiseta Deportiva Premium"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              required
            />
          </div>


          {/* CASO A: Área de texto que ocupa TODO EL ANCHO */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">
              Contenido
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Escribe el contenido de la publicación..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all min-h-25"
              rows={3}
            />
          </div>

          {/* Botones de Acción (Siempre al fondo y ocupando todo el ancho del grid) */}
          <div className="sm:col-span-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose && onClose()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-sm font-bold transition-all shadow-sm shadow-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitting
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar Publicación"
                    : "Guardar Publicación"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostsForm;
