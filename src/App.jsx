import axios from "axios";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  api,
  carService,
  driverService,
  ledgerService,
  noteService,
  routeService,
  scheduleService,
  tripService,
} from "./api";
import GlobalLoading from "./GlobalLoading";

function Navbar({
  onAddIncome,
  onAddExpense,
  onToggleTheme,
  theme,
  showFinanceActions = false,
  showThemeToggle = false,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-cyan-400/50 bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-amber-500 text-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/user-logo.png"
            alt="Truck"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover ring-2 ring-white/50 flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold truncate">
              Truck (Expenses and income)
            </h1>
            <p className="text-xs opacity-90 hidden sm:block">
              Ingresos y gastos de camiones
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {showFinanceActions && (
            <>
              <button
                onClick={onAddIncome}
                className="rounded-md bg-lime-500 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-lime-600"
              >
                <span className="hidden sm:inline">Añadir ingreso</span>
                <span className="sm:hidden">+I</span>
              </button>
              <button
                onClick={onAddExpense}
                className="rounded-md bg-rose-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-rose-700"
              >
                <span className="hidden sm:inline">Añadir gasto</span>
                <span className="sm:hidden">+G</span>
              </button>
            </>
          )}
          {showThemeToggle && (
            <button
              onClick={onToggleTheme}
              className="rounded-md border border-white/60 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {theme === "dark" ? "☼" : "☾"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ currentView, onChangeView, driverLogged = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: "driver", label: "Conductor" },
    { key: "map", label: "Mapa" },
    { key: "notes", label: "Notas y recordatorios" },
  ];

  const handleNavClick = (key) => {
    onChangeView(key);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed bottom-4 right-4 z-30 md:hidden rounded-full bg-cyan-600 p-3 text-white shadow-lg hover:bg-cyan-700"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <nav
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-cyan-200/60 bg-cyan-50 p-4 dark:border-slate-700/60 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full text-left rounded-md px-4 py-3 text-sm font-medium ${
                    currentView === item.key
                      ? "bg-cyan-600 text-white"
                      : "text-slate-700 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden w-64 border-r border-cyan-200/60 bg-cyan-50 p-4 dark:border-slate-700/60 dark:bg-slate-900 md:block">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onChangeView(item.key)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm ${
                currentView === item.key
                  ? "bg-cyan-100 text-cyan-900 ring-1 ring-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-100"
                  : "text-slate-700 hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

function StatCard({ title, value, hint, color = "cyan" }) {
  const colorMap = {
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
    indigo:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
    slate:
      "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300",
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    fuchsia:
      "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
    lime: "bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-300",
  };
  return (
    <div
      className={`rounded-xl border border-cyan-200/60 p-4 shadow-sm dark:border-slate-700/60 ${colorMap[color]}`}
    >
      <p className="text-sm">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Guardar",
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
        <div className="mt-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState("driver");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapMode, setMapMode] = useState("driver");
  const [driverSession, setDriverSession] = useState(() => {
    const saved = localStorage.getItem("driverAuth");
    return saved ? JSON.parse(saved) : { isLoggedIn: false };
  });

  // Dashboard retirado: no se requiere redirección
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "ingreso",
      truck: "Camión 001",
      amount: 2500000,
      date: "2025-10-05",
      note: "Flete Bogotá - Medellín",
    },
    {
      id: 2,
      type: "gasto",
      truck: "Camión 002",
      amount: 800000,
      date: "2025-10-06",
      note: "Combustible",
    },
    {
      id: 3,
      type: "gasto",
      truck: "Camión 001",
      amount: 350000,
      date: "2025-10-06",
      note: "Peajes",
    },
    {
      id: 4,
      type: "ingreso",
      truck: "Camión 003",
      amount: 1900000,
      date: "2025-10-07",
      note: "Flete Cali - Bogotá",
    },
  ]);

  const trucks = useMemo(() => ["Camión 001", "Camión 002", "Camión 003"], []);
  const [filters, setFilters] = useState({ truck: "Todos", from: "", to: "" });
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const passTruck = filters.truck === "Todos" || t.truck === filters.truck;
      const time = new Date(t.date).getTime();
      const passFrom =
        !filters.from || time >= new Date(filters.from).getTime();
      const passTo = !filters.to || time <= new Date(filters.to).getTime();
      return passTruck && passFrom && passTo;
    });
  }, [transactions, filters]);

  const totalIncome = filtered
    .filter((t) => t.type === "ingreso")
    .reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "gasto")
    .reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const [modal, setModal] = useState({ type: null });
  const [form, setForm] = useState({
    truck: trucks[0],
    amount: "",
    date: "",
    note: "",
  });

  const openIncome = () => setModal({ type: "ingreso" });
  const openExpense = () => setModal({ type: "gasto" });
  const closeModal = () => setModal({ type: null });

  const submitModal = () => {
    if (!form.amount || !form.date) return alert("Completa monto y fecha");
    const id = transactions.length
      ? Math.max(...transactions.map((t) => t.id)) + 1
      : 1;
    setTransactions((prev) => [
      {
        id,
        type: modal.type,
        truck: form.truck,
        amount: Number(form.amount),
        date: form.date,
        note: form.note,
      },
      ...prev,
    ]);
    setForm({ truck: trucks[0], amount: "", date: "", note: "" });
    closeModal();
  };

  return (
    <>
      <GlobalLoading />
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar
          onAddIncome={openIncome}
          onAddExpense={openExpense}
          onToggleTheme={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          theme={theme}
          showFinanceActions={false}
          showThemeToggle={false}
        />

        <div className="mx-auto flex max-w-7xl gap-3 sm:gap-6 px-3 sm:px-4 py-3 sm:py-6">
          <Sidebar
            currentView={currentView}
            onChangeView={setCurrentView}
            driverLogged={!!driverSession.isLoggedIn}
          />

          <main className="flex-1 min-w-0">
            {/* Dashboard retirado */}

            {currentView === "driver" && (
              <DriverModule
                onGoToMap={(placa) => {
                  if (!placa)
                    return alert("Primero inicia sesión y asegura una placa");
                  localStorage.setItem(
                    "mapCommand",
                    JSON.stringify({ action: "startServiceCapture", placa })
                  );
                  setMapMode("driver");
                  setCurrentView("map");
                }}
                onAuthChange={(auth) => setDriverSession(auth)}
              />
            )}

            {currentView === "map" && (
              <MapModule externalCenter={mapCenter} mode={mapMode} />
            )}
            {currentView === "notes" && <NotesModule />}
            {/* Perfil de Cliente deshabilitado */}
          </main>
        </div>

        <Modal
          open={!!modal.type}
          title={modal.type === "ingreso" ? "Añadir ingreso" : "Añadir gasto"}
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={
            modal.type === "ingreso" ? "Registrar ingreso" : "Registrar gasto"
          }
        >
          <div className="grid gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Camión
              </label>
              <select
                value={form.truck}
                onChange={(e) =>
                  setForm((f) => ({ ...f, truck: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
              >
                {trucks.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Monto (COP)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Fecha
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Detalle
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Descripción breve"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

function NotesModule() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cars, setCars] = useState([]);

  useEffect(() => {
    carService
      .getAll()
      .then((res) => setCars(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    noteService
      .getAll()
      .then((res) => {
        setNotes(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  // Derivar placas: priorizar las guardadas en driverCars (usadas en otros módulos)
  const getSavedPlates = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("driverCars") || "[]");
      return Array.isArray(stored)
        ? [
            ...new Set(
              stored
                .map((c) => (c && typeof c === "object" ? c.placa : null))
                .filter(Boolean)
            ),
          ]
        : [];
    } catch {
      return [];
    }
  };
  const propPlates = Array.isArray(cars)
    ? [
        ...new Set(
          cars
            .map((c) => (typeof c === "string" ? c : (c && c.placa) || null))
            .filter(Boolean)
        ),
      ]
    : [];
  const [plates, setPlates] = useState(() => {
    const saved = getSavedPlates();
    return saved.length ? saved : propPlates;
  });
  useEffect(() => {
    // Intentar refrescar placas si driverCars cambia por fuera
    const refresh = () => {
      const saved = getSavedPlates();
      const next = saved.length ? saved : propPlates;
      setPlates((prev) =>
        JSON.stringify(prev) !== JSON.stringify(next) ? next : prev
      );
    };
    const onStorage = (e) => {
      if (e.key === "driverCars") refresh();
    };
    window.addEventListener("storage", onStorage);
    const id = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [propPlates]);

  const [form, setForm] = useState({
    truck: "",
    title: "",
    text: "",
    hasDate: false,
    date: "",
  });

  // Asegurar que el camión seleccionado sea una placa válida
  useEffect(() => {
    if (!form.truck || !plates.includes(form.truck)) {
      setForm((f) => ({ ...f, truck: plates[0] || "" }));
    }
  }, [plates]);

  // Ya no necesitamos sincronizar con localStorage

  const addNote = async () => {
    if (!form.title && !form.text) return alert("Escribe un título o una nota");
    const item = {
      truck: form.truck || "",
      title: form.title.trim(),
      text: form.text.trim(),
      date: form.hasDate ? form.date : "",
      done: false,
    };
    try {
      const res = await noteService.create(item);
      setNotes((prev) => [res.data, ...prev]);
      setForm({
        truck: plates[0] || "",
        title: "",
        text: "",
        hasDate: false,
        date: "",
      });
    } catch (e) {
      alert("Error al crear nota");
    }
  };

  const toggleDone = async (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    try {
      const updated = { ...note, done: !note.done };
      await noteService.update(id, updated);
      setNotes((list) => list.map((n) => (n.id === id ? updated : n)));
    } catch (e) {
      alert("Error al actualizar nota");
    }
  };
  const removeNote = async (id) => {
    try {
      await noteService.delete(id);
      setNotes((list) => list.filter((n) => n.id !== id));
    } catch (e) {
      alert("Error al eliminar nota");
    }
  };

  const upcoming = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return notes
      .filter((n) => n.date && !n.done && n.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [notes]);

  return (
    <section className="grid gap-6">
      <div className="ui-card">
        <h2 className="ui-title">Notas y recordatorios</h2>
        <p className="ui-subtitle">
          Crea recordatorios por camión, con fecha opcional (calendario).
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Placa
            </label>
            <select
              value={form.truck}
              onChange={(e) =>
                setForm((f) => ({ ...f, truck: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.placa}>
                  {c.placa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Título
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Mantenimiento, SOAT, revisión, etc."
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Nota
            </label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              rows={3}
              placeholder="Detalle del recordatorio"
              className="mt-1 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hasDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hasDate: e.target.checked }))
                }
              />
              Añadir fecha (calendario)
            </label>
            {form.hasDate && (
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
              />
            )}
          </div>
          <div>
            <button onClick={addNote} className="btn btn-cyan">
              Agregar nota
            </button>
          </div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="ui-card">
          <h3 className="ui-title">Próximos recordatorios</h3>
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
            {upcoming.map((n) => (
              <li key={n.id} className="py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {n.title || "(Sin título)"}{" "}
                      <span className="badge badge-client ml-2">{n.truck}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Para: {n.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDone(n.id)}
                      className="btn btn-driver"
                    >
                      Marcar hecho
                    </button>
                    <button
                      onClick={() => removeNote(n.id)}
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ui-card">
        <h3 className="ui-title">Todas las notas</h3>
        {notes.length === 0 ? (
          <p className="ui-subtitle">No hay notas registradas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
            {notes.map((n) => (
              <li key={n.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          n.done ? "badge-driver" : "badge-client"
                        }`}
                      >
                        {n.done ? "Hecho" : "Pendiente"}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {n.title || "(Sin título)"}{" "}
                        <span className="text-xs text-slate-500">
                          {n.truck && `· ${n.truck}`}
                        </span>
                      </span>
                    </div>
                    {n.date && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Fecha: {n.date}
                      </p>
                    )}
                    {n.text && (
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {n.text}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDone(n.id)}
                      className="btn btn-secondary"
                    >
                      {n.done ? "Deshacer" : "Hecho"}
                    </button>
                    <button
                      onClick={() => removeNote(n.id)}
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function QuickQuote() {
  const [kg, setKg] = useState(10);
  const [quote, setQuote] = useState(null);
  const calc = () => setQuote(Math.round(kg * 500));
  return (
    <div className="mt-2 flex items-end gap-3">
      <div>
        <label className="block text-xs text-slate-600 dark:text-slate-300">
          Kilogramos
        </label>
        <input
          type="number"
          value={kg}
          onChange={(e) => setKg(Number(e.target.value))}
          className="mt-1 w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
        />
      </div>
      <button
        onClick={calc}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Calcular
      </button>
      {quote !== null && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Precio estimado:{" "}
          <span className="font-semibold">
            ${quote.toLocaleString("es-CO")} COP
          </span>
        </p>
      )}
    </div>
  );
}

function ApiTest() {
  return (
    <div className="mt-2">
      <button
        onClick={async () => {
          try {
            const res = await api.get("/shipments");
            alert("Hay " + res.data.length + " envíos (GET /api/shipments)");
          } catch (error) {
            alert(
              "Error al conectar con la API: " +
                (error.message || "Backend no disponible")
            );
          }
        }}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Probar API
      </button>
    </div>
  );
}

import L from "leaflet";
import {
  Circle,
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

function MapClickCapture({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { animate: true });
    }
  }, [center]);
  return null;
}

function MapModule({ externalCenter = null, mode = "driver" }) {
  // Vista inicial: Colombia completa
  const initialCenter = { lat: 4.5709, lng: -74.2973 };
  const colombiaBounds = [
    [-4.226, -81.7],
    [12.458, -66.85],
  ]; // Sudoeste, Noreste
  const [cars, setCars] = useState([]);

  useEffect(() => {
    carService
      .getAll()
      .then((res) => setCars(res.data))
      .catch(() => {});
  }, []);
  const [visiblePlacas, setVisiblePlacas] = useState([]);
  const [trackingPlaca, setTrackingPlaca] = useState(() => {
    const auth = localStorage.getItem("driverAuth");
    const parsed = auth ? JSON.parse(auth) : null;
    return parsed?.placa || "";
  });
  const [routesByPlaca, setRoutesByPlaca] = useState({});
  const [stopsByPlaca, setStopsByPlaca] = useState({});
  const [serviceRoutesByPlaca, setServiceRoutesByPlaca] = useState({});
  const [currentPos, setCurrentPos] = useState(null);
  const [watching, setWatching] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Búsqueda de ciudades/municipios/departamentos (Nominatim)
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [targetCenter, setTargetCenter] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [clientShipment, setClientShipment] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 3) {
        setResults([]);
        return;
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=co&addressdetails=1&limit=5&polygon_geojson=1`;
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "es" },
        });
        const data = await resp.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        // Silenciar errores de red/cancelación
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    // Inicializar placas visibles cuando se cargan los carros
    if (cars.length > 0) {
      setVisiblePlacas((prev) =>
        prev.length === 0 ? cars.map((c) => c.placa) : prev
      );
      // Cargar rutas y paradas para todas las placas visibles
      const loadRoutes = async () => {
        const routesInit = {};
        const stopsInit = {};
        const serviceInit = {};
        for (const c of cars) {
          try {
            const routeRes = await routeService.get(c.placa, "route");
            routesInit[c.placa] = routeRes.data.map((p) => ({
              lat: p.lat,
              lng: p.lng,
            }));
            const stopsRes = await routeService.get(c.placa, "stop");
            stopsInit[c.placa] = stopsRes.data.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              lat: p.lat,
              lng: p.lng,
              entregado: p.entregado,
              carga: p.carga,
              destino: p.destino,
            }));
            const serviceRes = await routeService.get(c.placa, "serviceRoute");
            serviceInit[c.placa] = serviceRes.data.map((p) => ({
              lat: p.lat,
              lng: p.lng,
            }));
          } catch (e) {
            routesInit[c.placa] = [];
            stopsInit[c.placa] = [];
            serviceInit[c.placa] = [];
          }
        }
        setRoutesByPlaca(routesInit);
        setStopsByPlaca(stopsInit);
        setServiceRoutesByPlaca(serviceInit);
      };
      loadRoutes();
    }
  }, [cars]);

  useEffect(() => {
    // Fix de iconos para Leaflet en bundlers
    const iconUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
    const iconRetinaUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
    const shadowUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
    L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
  }, []);

  // Comando externo para abrir captura de ruta de servicio (usado por Conductor)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mapCommand");
      if (!raw) return;
      const cmd = JSON.parse(raw);
      if (cmd && cmd.action === "startServiceCapture" && cmd.placa) {
        setServicePlaca(cmd.placa);
        setCaptureActive(true);
      } else if (
        cmd &&
        cmd.action === "showClientShipment" &&
        cmd.origin &&
        cmd.dest
      ) {
        const o = { lat: Number(cmd.origin.lat), lng: Number(cmd.origin.lng) };
        const d = { lat: Number(cmd.dest.lat), lng: Number(cmd.dest.lng) };
        setClientShipment({ origin: o, dest: d });
      }
      localStorage.removeItem("mapCommand");
    } catch (_) {}
  }, []);

  useEffect(() => {
    let watchId = null;
    if (watching && trackingPlaca && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const latlng = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentPos(latlng);
          setGeoError("");
          setRoutesByPlaca((prev) => {
            const next = { ...prev };
            const arr = Array.isArray(next[trackingPlaca])
              ? next[trackingPlaca]
              : [];
            next[trackingPlaca] = [...arr, latlng];
            return next;
          });
          // Guardar punto de ruta en BD
          try {
            await routeService.add({
              placa: trackingPlaca,
              type: "route",
              lat: latlng.lat,
              lng: latlng.lng,
              order: Date.now(),
            });
          } catch (e) {}
        },
        (err) => {
          console.warn("Geolocation error", err);
          setGeoError(err?.message || "Error de geolocalización");
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
    return () => {
      if (watchId !== null && "geolocation" in navigator)
        navigator.geolocation.clearWatch(watchId);
    };
  }, [watching, trackingPlaca]);

  // Autoactivar GPS cuando el modo es "driver" y hay placa
  useEffect(() => {
    if (mode === "driver" && trackingPlaca && !watching) {
      setWatching(true);
    }
  }, [mode, trackingPlaca]);

  const [newStop, setNewStop] = useState({
    nombre: "",
    lat: "",
    lng: "",
    carga: "",
    destino: "",
  });
  const [stopPlaca, setStopPlaca] = useState("");
  const addStop = async () => {
    const target = stopPlaca || trackingPlaca;
    if (!target) return alert("Selecciona una placa para la parada");
    if (!newStop.nombre || !newStop.lat || !newStop.lng)
      return alert("Completa nombre y coordenadas");
    const entry = {
      placa: target,
      type: "stop",
      nombre: newStop.nombre,
      lat: Number(newStop.lat),
      lng: Number(newStop.lng),
      entregado: false,
      carga: newStop.carga || "",
      destino: newStop.destino || "",
    };
    try {
      const res = await routeService.add(entry);
      setStopsByPlaca((prev) => {
        const stop = {
          id: res.data.id,
          nombre: res.data.nombre,
          lat: res.data.lat,
          lng: res.data.lng,
          entregado: res.data.entregado,
          carga: res.data.carga,
          destino: res.data.destino,
        };
        return { ...prev, [target]: [stop, ...(prev[target] || [])] };
      });
      setNewStop({ nombre: "", lat: "", lng: "", carga: "", destino: "" });
    } catch (e) {
      alert("Error al agregar parada");
    }
  };
  const addStopFromMap = (latlng) => {
    setNewStop((s) => ({
      ...s,
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
    }));
  };
  const markDelivered = async (targetPlaca, id) => {
    try {
      const stop = stopsByPlaca[targetPlaca]?.find((s) => s.id === id);
      if (!stop) return;
      await routeService.update(id, { ...stop, entregado: true });
      setStopsByPlaca((prev) => {
        const arr = Array.isArray(prev[targetPlaca]) ? prev[targetPlaca] : [];
        const nextArr = arr.map((s) =>
          s.id === id ? { ...s, entregado: true } : s
        );
        return { ...prev, [targetPlaca]: nextArr };
      });
    } catch (e) {
      alert("Error al marcar entregado");
    }
  };

  // Rutas de servicio (para que clientes vean qué camión puede hacer el envío)
  const [servicePlaca, setServicePlaca] = useState("");
  const [captureActive, setCaptureActive] = useState(false);
  const [serviceDraftPoints, setServiceDraftPoints] = useState([]);
  const onMapClick = (latlng) => {
    addStopFromMap(latlng);
    if (captureActive) setServiceDraftPoints((prev) => [...prev, latlng]);
  };
  const startCapture = () => {
    setServiceDraftPoints([]);
    setCaptureActive(true);
  };
  const saveServiceRoute = async () => {
    const target = servicePlaca || trackingPlaca;
    if (!target) return alert("Selecciona una placa para la ruta de servicio");
    if (serviceDraftPoints.length < 2)
      return alert("Añade al menos dos puntos para la ruta");
    try {
      await routeService.deleteByPlacaAndType(target, "serviceRoute");
      const batch = serviceDraftPoints.map((p, idx) => ({
        placa: target,
        type: "serviceRoute",
        lat: p.lat,
        lng: p.lng,
        order: idx,
      }));
      await routeService.saveBatch(batch);
      setServiceRoutesByPlaca((prev) => ({
        ...prev,
        [target]: serviceDraftPoints,
      }));
      setCaptureActive(false);
      setServiceDraftPoints([]);
    } catch (e) {
      alert("Error al guardar ruta de servicio");
    }
  };
  const clearServiceDraft = () => {
    setServiceDraftPoints([]);
    setCaptureActive(false);
  };

  const selectPlace = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    setTargetCenter({ lat, lng });
    setSearchMarker({ lat, lng });
    setSelectedPolygon(item.geojson || null);
  };

  // Calcular proximidad a una parada no entregada
  const toRad = (v) => (v * Math.PI) / 180;
  const haversine = (a, b) => {
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  useEffect(() => {
    if (!currentPos || !trackingPlaca) return;
    const arr = Array.isArray(stopsByPlaca[trackingPlaca])
      ? stopsByPlaca[trackingPlaca]
      : [];
    const next = arr.find((s) => !s.entregado);
    if (!next) return;
    const d = haversine(currentPos, { lat: next.lat, lng: next.lng });
    const threshold = 250; // metros
    if (d <= threshold) {
      const cargoInfo = next.carga ? `Carga: ${next.carga}` : "";
      const destInfo = next.destino ? `Destino: ${next.destino}` : "";
      const extra = [cargoInfo, destInfo].filter(Boolean).join(" • ");
      alert(
        `Estás cerca de la parada de ${trackingPlaca}: ${next.nombre}${
          extra ? ` — ${extra}` : ""
        } (≈${Math.round(d)} m)`
      );
    }
  }, [currentPos, stopsByPlaca, trackingPlaca]);

  const colorForPlaca = (placa) => {
    let hash = 0;
    for (let i = 0; i < placa.length; i++)
      hash = placa.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };
  const driverRouteColor = "#22c55e"; // verde
  const clientRouteColor = "#2563eb"; // azul

  return (
    <section className="ui-card">
      <h2 className="ui-title">Mapa de Recorrido</h2>
      <p className="ui-subtitle">
        Mapa nacional de Colombia: ciudades, municipios y departamentos.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Buscar lugar (ciudad/municipio/departamento)
          </label>
          <input
            type="text"
            placeholder="Ej: Medellín, Antioquia"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
          />
          {results.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900">
              {results.map((r) => (
                <li key={`${r.osm_id}-${r.place_id}`}>
                  <button
                    onClick={() => selectPlace(r)}
                    className="block w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {r.display_name.split(",")[0]}
                    </span>
                    <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                      {r.type}
                    </span>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {r.display_name}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Placa a seguir
          </label>
          <select
            value={trackingPlaca}
            onChange={(e) => setTrackingPlaca(e.target.value)}
            className="mt-1 w-44 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
          >
            <option value="">Selecciona</option>
            {cars.map((c) => (
              <option key={c.id} value={c.placa}>
                {c.placa}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWatching(true)} className="btn btn-driver">
            Iniciar seguimiento
          </button>
          <button
            onClick={() => setWatching(false)}
            className="btn btn-secondary"
          >
            Detener
          </button>
          {watching && (
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              GPS activo
            </span>
          )}
          {!watching && (
            <span className="text-xs text-slate-600 dark:text-slate-300">
              GPS inactivo
            </span>
          )}
          {geoError && (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {geoError}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Mostrar carros:
          </span>
          <div className="flex flex-wrap gap-2">
            {cars.map((c) => (
              <label key={c.id} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={visiblePlacas.includes(c.placa)}
                  onChange={(e) => {
                    setVisiblePlacas((prev) => {
                      if (e.target.checked)
                        return Array.from(new Set([...prev, c.placa]));
                      return prev.filter((p) => p !== c.placa);
                    });
                  }}
                />
                <span
                  className="rounded px-2 py-1"
                  style={{ backgroundColor: "#F1F5F9", color: "#0F172A" }}
                >
                  {c.placa}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <MapContainer
              center={currentPos || targetCenter || initialCenter}
              zoom={6}
              minZoom={5}
              maxBounds={colombiaBounds}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <MapController center={externalCenter || targetCenter} />
              {visiblePlacas.map((placa) => {
                const color = colorForPlaca(placa);
                const routeArr = Array.isArray(routesByPlaca[placa])
                  ? routesByPlaca[placa]
                  : [];
                const stopsArr = Array.isArray(stopsByPlaca[placa])
                  ? stopsByPlaca[placa]
                  : [];
                const serviceArr = Array.isArray(serviceRoutesByPlaca[placa])
                  ? serviceRoutesByPlaca[placa]
                  : [];
                const last = routeArr.length
                  ? routeArr[routeArr.length - 1]
                  : null;
                return (
                  <React.Fragment key={`layer-${placa}`}>
                    {routeArr.length > 1 && (
                      <Polyline
                        positions={routeArr}
                        pathOptions={{ color: driverRouteColor }}
                      />
                    )}
                    {last && <Marker position={last} />}
                    {placa === trackingPlaca && currentPos && (
                      <Circle
                        center={currentPos}
                        radius={250}
                        pathOptions={{ color: driverRouteColor, opacity: 0.3 }}
                      />
                    )}
                    {stopsArr.map((s) => (
                      <Marker
                        key={`${placa}-stop-${s.id}`}
                        position={{ lat: s.lat, lng: s.lng }}
                      ></Marker>
                    ))}
                    {serviceArr.length > 1 && (
                      <Polyline
                        positions={serviceArr}
                        pathOptions={{ color, weight: 3, dashArray: "6 6" }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
              {serviceDraftPoints.map((p, idx) => (
                <Marker key={`draft-${idx}`} position={p} />
              ))}
              {clientShipment && (
                <>
                  <Marker position={clientShipment.origin}>
                    <Popup>Origen</Popup>
                  </Marker>
                  <Marker position={clientShipment.dest}>
                    <Popup>Destino</Popup>
                  </Marker>
                  <Polyline
                    positions={[clientShipment.origin, clientShipment.dest]}
                    pathOptions={{ color: clientRouteColor, weight: 3 }}
                  />
                </>
              )}
              {searchMarker && <Marker position={searchMarker} />}
              {selectedPolygon && (
                <GeoJSON
                  data={selectedPolygon}
                  style={{ color: "#10B981", weight: 2, fillOpacity: 0.1 }}
                />
              )}
              <MapClickCapture onClick={onMapClick} />
            </MapContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Tip: haz clic en el mapa para capturar coordenadas y completar la
            parada.
          </p>
        </div>
        <div>
          <div className="rounded-lg border border-sky-200 bg-white p-3 shadow-sm dark:border-sky-700/60 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-sky-700 dark:text-sky-300">
              Añadir parada
            </h3>
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Placa
                </label>
                <select
                  value={stopPlaca}
                  onChange={(e) => setStopPlaca(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">
                    {trackingPlaca
                      ? `Usar placa seguida (${trackingPlaca})`
                      : "Selecciona"}
                  </option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.placa}>
                      {c.placa}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newStop.nombre}
                  onChange={(e) =>
                    setNewStop((s) => ({ ...s, nombre: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300">
                    Lat
                  </label>
                  <input
                    type="text"
                    value={newStop.lat}
                    onChange={(e) =>
                      setNewStop((s) => ({ ...s, lat: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300">
                    Lng
                  </label>
                  <input
                    type="text"
                    value={newStop.lng}
                    onChange={(e) =>
                      setNewStop((s) => ({ ...s, lng: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300">
                    Descripción de carga
                  </label>
                  <input
                    type="text"
                    value={newStop.carga}
                    onChange={(e) =>
                      setNewStop((s) => ({ ...s, carga: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-300">
                    Destino (texto)
                  </label>
                  <input
                    type="text"
                    value={newStop.destino}
                    onChange={(e) =>
                      setNewStop((s) => ({ ...s, destino: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <button
                onClick={addStop}
                className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Guardar parada
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Ruta de servicio (visible para clientes)
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Haz clic en el mapa para trazar la ruta del camión.
            </p>
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Placa
                </label>
                <select
                  value={servicePlaca}
                  onChange={(e) => setServicePlaca(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">
                    {trackingPlaca
                      ? `Usar placa seguida (${trackingPlaca})`
                      : "Selecciona"}
                  </option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.placa}>
                      {c.placa}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={startCapture}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Empezar captura
                </button>
                <button
                  onClick={saveServiceRoute}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Guardar ruta
                </button>
                <button
                  onClick={clearServiceDraft}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Limpiar
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Puntos: {serviceDraftPoints.length}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Paradas
            </h3>
            <ul className="mt-2 space-y-2">
              {visiblePlacas.map((placa) => {
                const arr = Array.isArray(stopsByPlaca[placa])
                  ? stopsByPlaca[placa]
                  : [];
                return (
                  <React.Fragment key={`stops-${placa}`}>
                    {arr.length === 0 ? (
                      <li className="text-xs text-slate-500">
                        Sin paradas para {placa}
                      </li>
                    ) : (
                      arr.map((s) => (
                        <li
                          key={`${placa}-s-${s.id}`}
                          className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800"
                        >
                          <div>
                            <p className="font-medium">
                              {s.nombre}{" "}
                              <span className="ml-1 text-xs text-slate-500">
                                ({placa})
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {s.lat}, {s.lng}
                            </p>
                            {(s.carga || s.destino) && (
                              <p className="text-xs text-slate-500">
                                {s.carga ? `Carga: ${s.carga}` : ""}{" "}
                                {s.destino ? `• Destino: ${s.destino}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {s.entregado ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                Entregado
                              </span>
                            ) : (
                              <button
                                onClick={() => markDelivered(placa, s.id)}
                                className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                              >
                                Marcar entregado
                              </button>
                            )}
                          </div>
                        </li>
                      ))
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Camiones disponibles
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Se muestran los camiones con rutas de servicio guardadas.
            </p>
            <ul className="mt-2 space-y-2">
              {cars.map((c) => {
                const arr = Array.isArray(serviceRoutesByPlaca[c.placa])
                  ? serviceRoutesByPlaca[c.placa]
                  : [];
                return (
                  <li
                    key={`available-${c.id}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.placa}</span>
                      {arr.length > 1 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                          Disponible
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Sin ruta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={arr.length < 2}
                        onClick={() => {
                          const center =
                            arr[Math.floor(arr.length / 2)] || null;
                          setTargetCenter(center);
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Ver en mapa
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function DriverModule({ onGoToMap, onAuthChange }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("driverAuth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          isLoggedIn: false,
          nombre: "",
          placa: "",
          telefono: "",
          id: null,
        };
      }
    }
    return { isLoggedIn: false, nombre: "", placa: "", telefono: "", id: null };
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("driverProfile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { nombre: "", telefono: "", cedula: "", ruta: "" };
      }
    }
    return { nombre: "", telefono: "", cedula: "", ruta: "" };
  });
  const [cars, setCars] = useState([]);

  useEffect(() => {
    carService
      .getAll()
      .then((res) => setCars(res.data))
      .catch(() => {});
  }, []);

  // Guardar auth en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("driverAuth", JSON.stringify(auth));
  }, [auth]);

  // Guardar profile en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("driverProfile", JSON.stringify(profile));
  }, [profile]);

  const [loginForm, setLoginForm] = useState({ nombre: "", placa: "" });
  const [phonePromptOpen, setPhonePromptOpen] = useState(false);
  const [phoneForm, setPhoneForm] = useState({ telefono: "" });
  const doLogin = async () => {
    if (!loginForm.nombre || !loginForm.placa)
      return alert("Ingresa nombre y placa del camión");
    try {
      const res = await driverService.login({
        nombre: loginForm.nombre,
        placa: loginForm.placa,
        telefono: "",
      });
      const driver = res.data;
      setAuth({
        isLoggedIn: true,
        nombre: driver.nombre || "",
        placa: driver.placa || "",
        telefono: driver.telefono || "",
        id: driver.id,
      });
      setProfile({
        nombre: driver.nombre || "",
        telefono: driver.telefono || "",
        cedula: driver.cedula || "",
        ruta: driver.ruta || "",
      });
      onAuthChange &&
        onAuthChange({
          isLoggedIn: true,
          nombre: driver.nombre,
          placa: driver.placa,
          telefono: driver.telefono,
        });
      if (!driver.telefono) {
        setPhoneForm({ telefono: "" });
        setPhonePromptOpen(true);
      }
    } catch (e) {
      console.log("error inciar session", e);

      alert("Error al iniciar sesión");
    }
  };
  const doLogout = () => {
    setAuth({
      isLoggedIn: false,
      nombre: "",
      placa: "",
      telefono: "",
      id: null,
    });
    setProfile({ nombre: "", telefono: "", cedula: "", ruta: "" });
    localStorage.removeItem("driverAuth");
    localStorage.removeItem("driverProfile");
    onAuthChange && onAuthChange({ isLoggedIn: false });
  };

  const [carForm, setCarForm] = useState({ placa: "", cargaPermitida: "" });
  const addCar = async () => {
    if (!carForm.placa || !carForm.cargaPermitida)
      return alert("Ingresa placa y carga permitida");
    try {
      const res = await carService.create({
        placa: carForm.placa,
        cargaPermitida: Number(carForm.cargaPermitida),
      });
      setCars((prev) => [res.data, ...prev]);
      setCarForm({ placa: "", cargaPermitida: "" });
    } catch (e) {
      alert("Error al agregar carro");
    }
  };
  const removeCar = async (id) => {
    try {
      await carService.delete(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert("Error al eliminar carro");
    }
  };

  // Gestión de conductores múltiples
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // Cargar todos los conductores del API
    driverService
      .getAll()
      .then((res) => setDrivers(res.data))
      .catch(() => {});
  }, []);

  const [driverForm, setDriverForm] = useState({
    nombre: "",
    telefono: "",
    placa: "",
  });
  const addDriver = async () => {
    if (!driverForm.nombre || !driverForm.telefono || !driverForm.placa)
      return alert("Completa nombre, teléfono y placa");
    try {
      const res = await driverService.login({
        nombre: driverForm.nombre,
        placa: driverForm.placa,
        telefono: driverForm.telefono,
      });
      setDrivers((prev) => [res.data, ...prev]);
      setDriverForm({ nombre: "", telefono: "", placa: "" });
    } catch (e) {
      alert("Error al agregar conductor");
    }
  };
  const removeDriver = async (id) => {
    try {
      await driverService.delete(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      alert("Error al eliminar conductor");
    }
  };

  if (!auth.isLoggedIn) {
    return (
      <section className="ui-card">
        <h2 className="ui-title">Inicio de sesión de Conductor</h2>
        <p className="ui-subtitle">Accede con tu nombre y placa del camión.</p>
        <div className="mt-4 grid max-w-md gap-3">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Nombre
            </label>
            <input
              type="text"
              value={loginForm.nombre}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, nombre: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Placa del camión
            </label>
            <input
              type="text"
              placeholder="ABC123"
              value={loginForm.placa}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, placa: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={doLogin} className="btn btn-driver">
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal: capturar teléfono inmediatamente tras el login */}
      <Modal
        open={phonePromptOpen}
        title="Tu número de teléfono"
        onClose={() => setPhonePromptOpen(false)}
        onSubmit={async () => {
          if (!phoneForm.telefono) return alert("Ingresa tu teléfono");
          try {
            await driverService.update(auth.id, {
              ...profile,
              telefono: phoneForm.telefono,
            });
            setAuth((prev) => ({ ...prev, telefono: phoneForm.telefono }));
            setProfile((p) => ({ ...p, telefono: phoneForm.telefono }));
            setPhonePromptOpen(false);
          } catch (e) {
            alert("Error al guardar teléfono");
          }
        }}
        submitLabel="Guardar"
      >
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Teléfono
          </label>
          <input
            type="tel"
            value={phoneForm.telefono}
            onChange={(e) => setPhoneForm({ telefono: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
          />
        </div>
      </Modal>

      <section className="ui-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="ui-title">Perfil del Conductor</h2>
            <p className="ui-subtitle">Completa tus datos básicos.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onGoToMap(auth.placa)}
              className="btn btn-driver"
            >
              Marcar ruta en mapa
            </button>
            <button onClick={doLogout} className="btn btn-secondary">
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Nombre
            </label>
            <input
              type="text"
              value={profile.nombre}
              onChange={(e) =>
                setProfile((p) => ({ ...p, nombre: e.target.value }))
              }
              onBlur={async () => {
                if (auth.id) {
                  try {
                    await driverService.update(auth.id, profile);
                  } catch (e) {}
                }
              }}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Placa (del camión de sesión)
            </label>
            <input
              type="text"
              value={auth.placa}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Teléfono
            </label>
            <input
              type="tel"
              value={profile.telefono}
              onChange={(e) =>
                setProfile((p) => ({ ...p, telefono: e.target.value }))
              }
              onBlur={async () => {
                if (auth.id) {
                  try {
                    await driverService.update(auth.id, profile);
                  } catch (e) {}
                }
              }}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Cédula
            </label>
            <input
              type="text"
              value={profile.cedula}
              onChange={(e) =>
                setProfile((p) => ({ ...p, cedula: e.target.value }))
              }
              onBlur={async () => {
                if (auth.id) {
                  try {
                    await driverService.update(auth.id, profile);
                  } catch (e) {}
                }
              }}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Ruta
            </label>
            <input
              type="text"
              placeholder="Origen - Destino"
              value={profile.ruta}
              onChange={(e) =>
                setProfile((p) => ({ ...p, ruta: e.target.value }))
              }
              onBlur={async () => {
                if (auth.id) {
                  try {
                    await driverService.update(auth.id, profile);
                  } catch (e) {}
                }
              }}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
        </div>
      </section>

      <section className="ui-card">
        <h2 className="ui-title">Carros del Conductor</h2>
        <p className="ui-subtitle">Puedes registrar varios carros.</p>

        <div className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Placa
            </label>
            <input
              type="text"
              value={carForm.placa}
              onChange={(e) =>
                setCarForm((f) => ({ ...f, placa: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Carga permitida (kg)
            </label>
            <input
              type="number"
              value={carForm.cargaPermitida}
              onChange={(e) =>
                setCarForm((f) => ({ ...f, cargaPermitida: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={addCar}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Añadir camión
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="px-3 py-2">Placa</th>
                <th className="px-3 py-2">Carga permitida</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2">{c.placa}</td>
                  <td className="px-3 py-2">{c.cargaPermitida} kg</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeCar(c.id)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No hay carros registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gestión de conductores múltiples */}
        <div className="mt-6 rounded-lg border border-slate-200/60 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            Gestión de conductores
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Registra múltiples conductores con su placa y teléfono.
          </p>
          <div className="mt-3 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Nombre
              </label>
              <input
                type="text"
                value={driverForm.nombre}
                onChange={(e) =>
                  setDriverForm((f) => ({ ...f, nombre: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Teléfono
              </label>
              <input
                type="tel"
                value={driverForm.telefono}
                onChange={(e) =>
                  setDriverForm((f) => ({ ...f, telefono: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300">
                Placa
              </label>
              <input
                type="text"
                value={driverForm.placa}
                onChange={(e) =>
                  setDriverForm((f) => ({ ...f, placa: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={addDriver} className="btn btn-cyan">
              Añadir conductor
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Teléfono</th>
                  <th className="px-3 py-2">Placa</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-3 py-2">{d.nombre}</td>
                    <td className="px-3 py-2">{d.telefono}</td>
                    <td className="px-3 py-2">{d.placa}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeDriver(d.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                    >
                      No hay conductores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Libro mayor por placa (ingresos/gastos generales del conductor) */}
        <DriverLedger cars={cars} lockPlaca={auth.placa} />

        {/* Gestión de viajes y contabilidad por viaje (bloqueado por placa de sesión) */}
        <TripManager cars={cars} lockPlaca={auth.placa} />

        {/* Gestión de horario de viaje por placa (bloqueado por placa de sesión) */}
        <ScheduleManager cars={cars} lockPlaca={auth.placa} />
      </section>
    </div>
  );
}

function ScheduleManager({ cars, lockPlaca = null }) {
  const [scheduleByPlaca, setScheduleByPlaca] = useState({});
  const [selectedPlaca, setSelectedPlaca] = useState(
    lockPlaca || cars[0]?.placa || ""
  );
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    scheduleService
      .getAll()
      .then((res) => {
        const byPlaca = {};
        res.data.forEach((s) => {
          byPlaca[s.placa] = {
            ida: s.idaDays ? s.idaDays.split(",") : [],
            regreso: s.regresoDays ? s.regresoDays.split(",") : [],
          };
        });
        setScheduleByPlaca(byPlaca);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (lockPlaca) setSelectedPlaca(lockPlaca);
  }, [lockPlaca]);

  const normalize = (entry) => {
    if (!entry) return { ida: [], regreso: [] };
    if (Array.isArray(entry)) return { ida: entry, regreso: [] };
    const ida = Array.isArray(entry.ida) ? entry.ida : [];
    const regreso = Array.isArray(entry.regreso) ? entry.regreso : [];
    return { ida, regreso };
  };

  const current = normalize(scheduleByPlaca[selectedPlaca]);
  const toggleDay = (tipo, d) => {
    if (!selectedPlaca) return;
    setScheduleByPlaca((prev) => {
      const curr = normalize(prev[selectedPlaca]);
      const setRef = new Set(curr[tipo]);
      if (setRef.has(d)) setRef.delete(d);
      else setRef.add(d);
      const nextCurr = { ...curr, [tipo]: Array.from(setRef) };
      return { ...prev, [selectedPlaca]: nextCurr };
    });
  };

  const saveSchedule = async () => {
    if (!selectedPlaca) return alert("Selecciona una placa");
    const current = normalize(scheduleByPlaca[selectedPlaca]);
    const schedule = {
      placa: selectedPlaca,
      idaDays: current.ida.join(","),
      regresoDays: current.regreso.join(","),
    };
    try {
      await scheduleService.save(schedule);
      alert(`Horario guardado para placa ${selectedPlaca}`);
    } catch (e) {
      alert("Error al guardar el horario");
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-slate-200/60 p-4 dark:border-slate-700/60">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
        Horario de viaje por placa
      </h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        Selecciona la placa y marca los días de ida y de regreso.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Placa
          </label>
          {lockPlaca ? (
            <input
              type="text"
              value={lockPlaca}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
            />
          ) : (
            <select
              value={selectedPlaca}
              onChange={(e) => setSelectedPlaca(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.placa}>
                  {c.placa}
                </option>
              ))}
              {cars.length === 0 && (
                <option value="" disabled>
                  No hay placas
                </option>
              )}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Días de ida
          </label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {days.map((d) => (
              <label
                key={`ida-${d}`}
                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={current.ida.includes(d)}
                  onChange={() => toggleDay("ida", d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Días de regreso
          </label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {days.map((d) => (
              <label
                key={`reg-${d}`}
                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={current.regreso.includes(d)}
                  onChange={() => toggleDay("regreso", d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={saveSchedule}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Guardar horario
        </button>
      </div>
    </div>
  );
}

// Libro mayor por placa (no ligado a viaje)
function DriverLedger({ cars, lockPlaca = null }) {
  const [selectedPlaca, setSelectedPlaca] = useState(
    lockPlaca || cars[0]?.placa || ""
  );
  const [entries, setEntries] = useState([]);
  const [entryForm, setEntryForm] = useState({
    type: "ingreso",
    amount: "",
    date: "",
    note: "",
  });
  const [editId, setEditId] = useState(null);
  const locked = !!lockPlaca;

  useEffect(() => {
    if (lockPlaca) setSelectedPlaca(lockPlaca);
  }, [lockPlaca]);
  useEffect(() => {
    if (!selectedPlaca) {
      setEntries([]);
      return;
    }
    ledgerService
      .getByPlaca(selectedPlaca)
      .then((res) => setEntries(res.data))
      .catch(() => {});
  }, [selectedPlaca]);

  const addEntry = async () => {
    if (!selectedPlaca) return alert("Selecciona una placa");
    if (!entryForm.amount || !entryForm.date)
      return alert("Completa monto y fecha");
    const entry = {
      placa: selectedPlaca,
      type: entryForm.type,
      amount: Number(entryForm.amount),
      date: entryForm.date,
      note: entryForm.note || "",
    };
    try {
      const res = await ledgerService.create(entry);
      setEntries([res.data, ...entries]);
      setEntryForm({ type: "ingreso", amount: "", date: "", note: "" });
    } catch (e) {
      alert("Error al agregar entrada");
    }
  };
  const startEdit = (id) => setEditId(id);
  const saveEdit = async () => {
    const edited = entries.find((e) => e.id === editId);
    if (!edited) return setEditId(null);
    if (!edited.amount || !edited.date) return alert("Completa monto y fecha");
    try {
      await ledgerService.update(editId, {
        ...edited,
        amount: Number(edited.amount),
      });
      setEntries(
        entries.map((e) =>
          e.id === editId ? { ...edited, amount: Number(edited.amount) } : e
        )
      );
      setEditId(null);
    } catch (e) {
      alert("Error al guardar");
    }
  };
  const deleteEntry = async (id) => {
    try {
      await ledgerService.delete(id);
      setEntries(entries.filter((e) => e.id !== id));
      if (editId === id) setEditId(null);
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const totalIncome = entries
    .filter((e) => e.type === "ingreso")
    .reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = entries
    .filter((e) => e.type === "gasto")
    .reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="mt-6 rounded-lg border border-slate-200/60 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
        Libro mayor por placa
      </h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        Registra ingresos y gastos generales del camión.
      </p>
      <div className="mt-3 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Placa
          </label>
          {locked ? (
            <input
              type="text"
              value={lockPlaca}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
            />
          ) : (
            <select
              value={selectedPlaca}
              onChange={(e) => setSelectedPlaca(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.placa}>
                  {c.placa}
                </option>
              ))}
              {cars.length === 0 && (
                <option value="" disabled>
                  No hay placas
                </option>
              )}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Tipo
          </label>
          <select
            value={entryForm.type}
            onChange={(e) =>
              setEntryForm((f) => ({ ...f, type: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Monto (COP)
          </label>
          <input
            type="number"
            value={entryForm.amount}
            onChange={(e) =>
              setEntryForm((f) => ({ ...f, amount: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Fecha
          </label>
          <input
            type="date"
            value={entryForm.date}
            onChange={(e) =>
              setEntryForm((f) => ({ ...f, date: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Nota
          </label>
          <input
            type="text"
            value={entryForm.note}
            onChange={(e) =>
              setEntryForm((f) => ({ ...f, note: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={addEntry}
          className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          Añadir entrada
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Monto</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Nota</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="px-3 py-2">
                  {editId === e.id ? (
                    <select
                      value={e.type}
                      onChange={(ev) => {
                        const next = entries.map((x) =>
                          x.id === e.id ? { ...x, type: ev.target.value } : x
                        );
                        setEntries(next);
                      }}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="ingreso">Ingreso</option>
                      <option value="gasto">Gasto</option>
                    </select>
                  ) : (
                    e.type
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === e.id ? (
                    <input
                      type="number"
                      value={e.amount}
                      onChange={(ev) => {
                        const next = entries.map((x) =>
                          x.id === e.id ? { ...x, amount: ev.target.value } : x
                        );
                        setEntries(next);
                      }}
                      className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  ) : (
                    <span>{Number(e.amount).toLocaleString("es-CO")}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === e.id ? (
                    <input
                      type="date"
                      value={e.date}
                      onChange={(ev) => {
                        const next = entries.map((x) =>
                          x.id === e.id ? { ...x, date: ev.target.value } : x
                        );
                        setEntries(next);
                      }}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  ) : (
                    e.date
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === e.id ? (
                    <input
                      type="text"
                      value={e.note}
                      onChange={(ev) => {
                        const next = entries.map((x) =>
                          x.id === e.id ? { ...x, note: ev.target.value } : x
                        );
                        setEntries(next);
                      }}
                      className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  ) : (
                    e.note
                  )}
                </td>
                <td className="px-3 py-2">
                  {editId === e.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(e.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteEntry(e.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800/40"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  Aún no hay registros para esta placa
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Ingresos"
          value={`$ ${totalIncome.toLocaleString("es-CO")}`}
          color="emerald"
        />
        <StatCard
          title="Gastos"
          value={`$ ${totalExpense.toLocaleString("es-CO")}`}
          color="rose"
        />
        <StatCard
          title="Saldo"
          value={`$ ${balance.toLocaleString("es-CO")}`}
          color={balance >= 0 ? "indigo" : "rose"}
        />
      </div>
    </div>
  );
}

function TripManager({ cars, lockPlaca = null }) {
  const [trips, setTrips] = useState([]);
  const [tripForm, setTripForm] = useState({
    placa: lockPlaca || cars[0]?.placa || "",
    nombre: "",
    inicio: "",
    fin: "",
  });
  const [activeTripId, setActiveTripId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entryForm, setEntryForm] = useState({
    type: "ingreso",
    amount: "",
    date: "",
    note: "",
  });
  const [editEntryId, setEditEntryId] = useState(null);
  const locked = !!lockPlaca;

  useEffect(() => {
    tripService
      .getAll()
      .then((res) => setTrips(res.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    // Si se bloquea por placa, asegurar que el viaje activo pertenezca a la placa
    if (!activeTripId) return;
    const found = trips.find((t) => t.id === activeTripId);
    if (!found) return;
    if (locked && found.placa !== lockPlaca) setActiveTripId(null);
  }, [lockPlaca, locked, trips]);
  useEffect(() => {
    if (activeTripId) {
      tripService
        .getTransactions(activeTripId)
        .then((res) => setEntries(res.data))
        .catch(() => {});
    } else {
      setEntries([]);
    }
  }, [activeTripId]);

  const addTrip = async () => {
    if (!tripForm.placa || !tripForm.nombre || !tripForm.inicio)
      return alert("Completa placa, nombre e inicio");
    const entry = {
      placa: locked ? lockPlaca : tripForm.placa,
      nombre: tripForm.nombre,
      inicio: tripForm.inicio,
      fin: tripForm.fin || "",
    };
    try {
      const res = await tripService.create(entry);
      setTrips((prev) => [res.data, ...prev]);
      setActiveTripId(res.data.id);
      setTripForm({
        placa: locked ? lockPlaca : cars[0]?.placa || "",
        nombre: "",
        inicio: "",
        fin: "",
      });
    } catch (e) {
      alert("Error al crear viaje");
    }
  };
  const removeTrip = async (id) => {
    if (!confirm("¿Eliminar este viaje y su contabilidad?")) return;
    try {
      await tripService.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      if (activeTripId === id) setActiveTripId(null);
    } catch (e) {
      alert("Error al eliminar viaje");
    }
  };

  const addEntry = async () => {
    if (!activeTripId) return alert("Selecciona un viaje");
    if (!entryForm.amount || !entryForm.date)
      return alert("Completa monto y fecha");
    const entry = {
      type: entryForm.type,
      amount: Number(entryForm.amount),
      date: entryForm.date,
      note: entryForm.note || "",
    };
    try {
      const res = await tripService.createTransaction(activeTripId, entry);
      setEntries([res.data, ...entries]);
      setEntryForm({ type: "ingreso", amount: "", date: "", note: "" });
    } catch (e) {
      alert("Error al agregar entrada");
    }
  };
  const startEditEntry = (id) => setEditEntryId(id);
  const saveEditEntry = async () => {
    const edited = entries.find((e) => e.id === editEntryId);
    if (!edited) return setEditEntryId(null);
    if (!edited.amount || !edited.date) return alert("Completa monto y fecha");
    try {
      await tripService.updateTransaction(editEntryId, {
        ...edited,
        amount: Number(edited.amount),
      });
      setEntries(
        entries.map((e) =>
          e.id === editEntryId
            ? { ...edited, amount: Number(edited.amount) }
            : e
        )
      );
      setEditEntryId(null);
    } catch (e) {
      alert("Error al guardar");
    }
  };
  const deleteEntry = async (id) => {
    try {
      await tripService.deleteTransaction(id);
      setEntries(entries.filter((e) => e.id !== id));
      if (editEntryId === id) setEditEntryId(null);
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const totalIncome = entries
    .filter((e) => e.type === "ingreso")
    .reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = entries
    .filter((e) => e.type === "gasto")
    .reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="mt-6 rounded-lg border border-slate-200/60 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
        Gestión de viajes
      </h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        Crea viajes y registra ingresos/gastos por viaje.
      </p>
      <div className="mt-3 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Placa
          </label>
          {locked ? (
            <input
              type="text"
              value={lockPlaca}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
            />
          ) : (
            <select
              value={tripForm.placa}
              onChange={(e) =>
                setTripForm((f) => ({ ...f, placa: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.placa}>
                  {c.placa}
                </option>
              ))}
              {cars.length === 0 && (
                <option value="" disabled>
                  No hay placas
                </option>
              )}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Nombre del viaje
          </label>
          <input
            type="text"
            value={tripForm.nombre}
            onChange={(e) =>
              setTripForm((f) => ({ ...f, nombre: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Inicio
          </label>
          <input
            type="date"
            value={tripForm.inicio}
            onChange={(e) =>
              setTripForm((f) => ({ ...f, inicio: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-300">
            Fin (opcional)
          </label>
          <input
            type="date"
            value={tripForm.fin}
            onChange={(e) =>
              setTripForm((f) => ({ ...f, fin: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={addTrip}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Crear viaje
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Placa</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Inicio</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trips
              .filter((t) => !locked || t.placa === lockPlaca)
              .map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2">{t.id}</td>
                  <td className="px-3 py-2">{t.placa}</td>
                  <td className="px-3 py-2">{t.nombre}</td>
                  <td className="px-3 py-2">{t.inicio}</td>
                  <td className="px-3 py-2">{t.fin || "-"}</td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    <button
                      onClick={() => setActiveTripId(t.id)}
                      className={`rounded-md px-2 py-1 text-xs ${
                        activeTripId === t.id
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      Seleccionar
                    </button>
                    <button
                      onClick={() => removeTrip(t.id)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            {trips.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No hay viajes creados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
          Contabilidad del viaje seleccionado
        </h4>
        {!activeTripId ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Selecciona un viaje para registrar ingresos y gastos.
          </p>
        ) : (
          <>
            <div className="mt-2 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Tipo
                </label>
                <select
                  value={entryForm.type}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Monto (COP)
                </label>
                <input
                  type="number"
                  value={entryForm.amount}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Fecha
                </label>
                <input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Nota
                </label>
                <input
                  type="text"
                  value={entryForm.note}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, note: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={addEntry}
                className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
              >
                Añadir entrada
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400">
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Monto</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Nota</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr
                      key={e.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2">
                        {editEntryId === e.id ? (
                          <select
                            value={e.type}
                            onChange={(ev) => {
                              const next = entries.map((x) =>
                                x.id === e.id
                                  ? { ...x, type: ev.target.value }
                                  : x
                              );
                              setEntries(next);
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          >
                            <option value="ingreso">Ingreso</option>
                            <option value="gasto">Gasto</option>
                          </select>
                        ) : (
                          e.type
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editEntryId === e.id ? (
                          <input
                            type="number"
                            value={e.amount}
                            onChange={(ev) => {
                              const next = entries.map((x) =>
                                x.id === e.id
                                  ? { ...x, amount: ev.target.value }
                                  : x
                              );
                              setEntries(next);
                            }}
                            className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                        ) : (
                          <span>
                            {Number(e.amount).toLocaleString("es-CO")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editEntryId === e.id ? (
                          <input
                            type="date"
                            value={e.date}
                            onChange={(ev) => {
                              const next = entries.map((x) =>
                                x.id === e.id
                                  ? { ...x, date: ev.target.value }
                                  : x
                              );
                              setEntries(next);
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                        ) : (
                          e.date
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editEntryId === e.id ? (
                          <input
                            type="text"
                            value={e.note}
                            onChange={(ev) => {
                              const next = entries.map((x) =>
                                x.id === e.id
                                  ? { ...x, note: ev.target.value }
                                  : x
                              );
                              setEntries(next);
                            }}
                            className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                        ) : (
                          e.note
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editEntryId === e.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={saveEditEntry}
                              className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditEntryId(null)}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditEntry(e.id)}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteEntry(e.id)}
                              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800/40"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                      >
                        Aún no hay registros para este viaje
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                title="Ingresos"
                value={`$ ${totalIncome.toLocaleString("es-CO")}`}
                color="emerald"
              />
              <StatCard
                title="Gastos"
                value={`$ ${totalExpense.toLocaleString("es-CO")}`}
                color="rose"
              />
              <StatCard
                title="Saldo"
                value={`$ ${balance.toLocaleString("es-CO")}`}
                color={balance >= 0 ? "indigo" : "rose"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClientModule({ onViewMap, onAuthChange }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("clientAuth");
    return saved
      ? JSON.parse(saved)
      : { isLoggedIn: false, nombre: "", telefono: "" };
  });
  useEffect(() => {
    localStorage.setItem("clientAuth", JSON.stringify(auth));
  }, [auth]);

  const [loginForm, setLoginForm] = useState({ nombre: "", telefono: "" });
  const doLogin = () => {
    if (!loginForm.nombre || !loginForm.telefono)
      return alert("Ingresa nombre y teléfono");
    const next = {
      isLoggedIn: true,
      nombre: loginForm.nombre,
      telefono: loginForm.telefono,
    };
    setAuth(next);
    onAuthChange && onAuthChange(next);
  };
  const doLogout = () => {
    setAuth({ isLoggedIn: false, nombre: "", telefono: "" });
    onAuthChange && onAuthChange({ isLoggedIn: false });
  };

  const [quote, setQuote] = useState({ origen: "", destino: "", peso: "" });
  const [quoteResult, setQuoteResult] = useState(null);
  const toRad = (v) => (v * Math.PI) / 180;
  const haversine = (a, b) => {
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const geocode = async (q) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&countrycodes=co&limit=1`;
    const res = await axios.get(url);
    if (!res.data || !res.data.length)
      throw new Error("No se encontró ubicación");
    return { lat: Number(res.data[0].lat), lng: Number(res.data[0].lon) };
  };
  const calcQuote = async () => {
    try {
      if (!quote.origen || !quote.destino || !quote.peso)
        return alert("Escribe origen, destino y peso");
      const pesoKg = Number(quote.peso);
      if (isNaN(pesoKg) || pesoKg <= 0)
        return alert("Ingresa un peso válido (kg)");
      const [o, d] = await Promise.all([
        geocode(quote.origen),
        geocode(quote.destino),
      ]);
      const distKm = haversine(o, d) / 1000;
      const distCost = Math.round((distKm / 100) * 2000);
      const weightCost = Math.round((pesoKg / 60) * 20000);
      const price = distCost + weightCost;
      setQuoteResult({ distKm, price, o, d, pesoKg, distCost, weightCost });
      // Enviar al mapa los puntos de origen y destino para marcarlos
      localStorage.setItem(
        "mapCommand",
        JSON.stringify({ action: "showClientShipment", origin: o, dest: d })
      );
      onViewMap({ lat: (o.lat + d.lat) / 2, lng: (o.lng + d.lng) / 2 });
    } catch (e) {
      alert("Error calculando cotización: " + (e.message || ""));
    }
  };

  const [cars, setCars] = useState(() => {
    const saved = localStorage.getItem("driverCars");
    return saved ? JSON.parse(saved) : [];
  });
  const [scheduleByPlaca] = useState(() => {
    const saved = localStorage.getItem("driverScheduleByPlaca");
    return saved ? JSON.parse(saved) : {};
  });
  const [driversList] = useState(() => {
    const saved = localStorage.getItem("driversList");
    return saved ? JSON.parse(saved) : [];
  });

  const availableTrucks = cars
    .map((c) => {
      const serv = localStorage.getItem(`serviceRoute:${c.placa}`);
      const arr = serv ? JSON.parse(serv) : [];
      if (!Array.isArray(arr) || arr.length < 2) return null;
      const center = arr.reduce(
        (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
        { lat: 0, lng: 0 }
      );
      center.lat /= arr.length;
      center.lng /= arr.length;
      const sched = scheduleByPlaca[c.placa];
      const normalize = (entry) => {
        if (!entry) return { ida: [], regreso: [] };
        if (Array.isArray(entry)) return { ida: entry, regreso: [] };
        return {
          ida: Array.isArray(entry.ida) ? entry.ida : [],
          regreso: Array.isArray(entry.regreso) ? entry.regreso : [],
        };
      };
      const driver = driversList.find((d) => d.placa === c.placa);
      return {
        placa: c.placa,
        center,
        schedule: normalize(sched),
        driverName: driver ? driver.nombre : null,
      };
    })
    .filter(Boolean);

  if (!auth.isLoggedIn) {
    return (
      <section className="ui-card">
        <h2 className="ui-title">Inicio de sesión de Cliente</h2>
        <p className="ui-subtitle">
          Accede para ver conductores, rutas y cotizar envíos.
        </p>
        <div className="mt-4 grid max-w-md gap-3">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Nombre
            </label>
            <input
              type="text"
              value={loginForm.nombre}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, nombre: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Teléfono
            </label>
            <input
              type="tel"
              value={loginForm.telefono}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, telefono: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <button onClick={doLogin} className="btn btn-client">
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="ui-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="ui-title">Cotizar envío</h2>
            <p className="ui-subtitle">
              Calcula un valor estimado según distancia y peso.
            </p>
          </div>
          <button onClick={doLogout} className="btn btn-secondary">
            Cerrar sesión
          </button>
        </div>
        <div className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Origen
            </label>
            <input
              type="text"
              value={quote.origen}
              onChange={(e) =>
                setQuote((q) => ({ ...q, origen: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Destino
            </label>
            <input
              type="text"
              value={quote.destino}
              onChange={(e) =>
                setQuote((q) => ({ ...q, destino: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Peso (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={quote.peso}
              onChange={(e) =>
                setQuote((q) => ({ ...q, peso: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="mt-3">
          <button onClick={calcQuote} className="btn btn-client">
            Calcular
          </button>
        </div>
        {quoteResult && (
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800/50 dark:text-slate-200">
            <p>Distancia: {quoteResult.distKm.toFixed(1)} km</p>
            <p>Peso: {quoteResult.pesoKg.toFixed(1)} kg</p>
            <p>
              Costo por distancia: $
              {quoteResult.distCost.toLocaleString("es-CO")}
            </p>
            <p>
              Costo por peso: ${quoteResult.weightCost.toLocaleString("es-CO")}
            </p>
            <p className="font-medium">
              Valor estimado: ${quoteResult.price.toLocaleString("es-CO")}
            </p>
          </div>
        )}
      </section>

      <section className="ui-card">
        <h2 className="ui-title">Conductores disponibles</h2>
        <p className="ui-subtitle">
          Rutas de servicio guardadas y sus días de viaje.
        </p>
        <div className="mt-4 grid gap-3">
          {availableTrucks.map((t) => (
            <div
              key={t.placa}
              className="flex items-center justify-between rounded-md border border-blue-200 p-3 text-sm dark:border-blue-700/60"
            >
              <div>
                <p className="font-medium">{t.placa}</p>
                {t.driverName && (
                  <p className="text-xs text-slate-500">
                    Conductor: {t.driverName}
                  </p>
                )}
                {t.schedule.ida.length === 0 &&
                t.schedule.regreso.length === 0 ? (
                  <p className="text-xs text-slate-500">Sin horario asignado</p>
                ) : (
                  <>
                    <p className="text-xs text-slate-500">
                      Ida: {t.schedule.ida.join(", ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      Regreso: {t.schedule.regreso.join(", ")}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewMap(t.center)}
                  className="rounded-md border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-slate-800/40"
                >
                  Ver en mapa
                </button>
              </div>
            </div>
          ))}
          {availableTrucks.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay rutas de servicio guardadas aún.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
