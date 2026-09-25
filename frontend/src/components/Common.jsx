import React from "react";
import { ArrowUpRight, Inbox, LoaderCircle, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
export const Footer = () => (
  <footer className="app-footer" data-testid="footer">
    <span>© {new Date().getFullYear()} CRM Maiharta</span>
    <span>
      Design dan develop by{" "}
      <a
        href="https://www.maiharta.com"
        target="_blank"
        rel="noreferrer"
        data-testid="maiharta-credit-link"
      >
        MaiHarta <ArrowUpRight size={12} />
      </a>
    </span>
  </footer>
);
export const Badge = ({ children, id }) => {
  const text = String(children || "");
  const tone = /Selesai|Production|Diterima|Disetujui|Aktif/.test(text)
    ? "green"
    : /Revisi|Menunggu|Testing|Sedang/.test(text)
      ? "amber"
      : /Ditolak|Mendesak|Tinggi/.test(text)
        ? "red"
        : /Development|Dikerjakan|Ditinjau/.test(text)
          ? "blue"
          : "neutral";
  return (
    <span data-testid={id} className={`status-badge ${tone}`}>
      <i />
      {text === "Uploaded to Production"
        ? "Production"
        : text === "Uploaded to Dev Server"
          ? "Dev Server"
          : children}
    </span>
  );
};
export const PageHead = ({ eyebrow, title, description, children }) => (
  <div className="page-head">
    <div>
      {eyebrow && (
        <div className="eyebrow" data-testid="page-eyebrow">
          {eyebrow}
        </div>
      )}
      <h1 data-testid="page-title">{title}</h1>
      {description && <p data-testid="page-description">{description}</p>}
    </div>
    <div className="page-actions">{children}</div>
  </div>
);
export const Empty = ({ message = "Belum ada data.", children }) => (
  <div className="empty-state" data-testid="empty-state">
    <Inbox size={32} />
    <p>{message}</p>
    {children}
  </div>
);
export const Loading = () => (
  <div className="content-loading" data-testid="content-loading">
    <LoaderCircle className="spin" size={26} />
    <span>Memuat data...</span>
  </div>
);
export const ErrorState = ({ error, reload }) => (
  <div className="error-state" data-testid="error-state">
    <p>{error}</p>
    <Button data-testid="retry-button" onClick={reload}>
      Coba lagi
    </Button>
  </div>
);
export const AddButton = ({
  onClick,
  children = "Tambah",
  id = "add-button",
}) => (
  <Button data-testid={id} onClick={onClick} className="primary-button">
    <Plus size={17} />
    {children}
  </Button>
);
export const Field = ({
  label,
  name,
  as = "input",
  options = [],
  hint,
  ...props
}) => (
  <label className="form-field">
    <span>
      {label}
      {props.required && (
        <em className="req-mark" title="Wajib diisi">
          *
        </em>
      )}
      {!props.required && as !== "select" && hint !== false && (
        <small className="opt-mark">(opsional)</small>
      )}
    </span>
    {as === "select" ? (
      <select data-testid={`field-${name}`} name={name} {...props}>
        {options.map((o) => (
          <option
            key={typeof o === "string" ? o : o.value}
            value={typeof o === "string" ? o : o.value}
          >
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    ) : as === "textarea" ? (
      <textarea data-testid={`field-${name}`} name={name} {...props} />
    ) : (
      <Input data-testid={`field-${name}`} name={name} {...props} />
    )}
  </label>
);
export const SubtaskInput = ({
  label = "Subtask",
  value = [],
  onChange,
  testid = "subtask",
}) => {
  const [text, setText] = React.useState("");
  const list = value || [];
  const add = () => {
    const t = text.trim();
    if (!t) return;
    onChange([...list, t]);
    setText("");
  };
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  return (
    <label className="form-field subtask-field">
      <span>
        {label}
        <small className="opt-mark">(opsional)</small>
      </span>
      <div className="subtask-builder" data-testid={`${testid}-builder`}>
        {list.length > 0 && (
          <div className="subtask-rows">
            {list.map((s, i) => (
              <div
                className="subtask-row"
                key={i}
                data-testid={`${testid}-row-${i}`}
              >
                <span className="subtask-dot" />
                <span className="subtask-text">{s}</span>
                <button
                  type="button"
                  className="subtask-remove"
                  data-testid={`${testid}-remove-${i}`}
                  onClick={() => remove(i)}
                  aria-label="Hapus subtask"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="subtask-add">
          <Plus size={15} />
          <input
            data-testid={`${testid}-input`}
            className="subtask-add-input"
            placeholder="Tambahkan subtask, tekan Enter"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button
            type="button"
            className="subtask-add-btn"
            data-testid={`${testid}-add`}
            onClick={add}
            disabled={!text.trim()}
          >
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>
    </label>
  );
};
export const Modal = ({ open, onClose, title, description, children }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="app-modal" data-testid="form-modal">
      <DialogHeader>
        <DialogTitle data-testid="modal-title">{title}</DialogTitle>
        <DialogDescription className={!description ? "sr-only" : ""}>
          {description || title}
        </DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
export const SaveButton = ({ busy, label = "Simpan" }) => (
  <Button
    type="submit"
    data-testid="save-button"
    className="primary-button"
    disabled={busy}
  >
    {busy && <LoaderCircle className="spin" size={16} />}{" "}
    {busy ? "Menyimpan..." : label}
  </Button>
);
export const Progress = ({ value, id }) => (
  <div className="progress-wrapper" data-testid={id}>
    <div className="progress-track">
      <div style={{ width: `${value || 0}%` }} />
    </div>
    <span>{value || 0}%</span>
  </div>
);
