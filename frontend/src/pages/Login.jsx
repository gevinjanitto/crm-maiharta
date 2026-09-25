<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
=======
<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
=======
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  RotateCw,
  ShieldCheck,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../App";
<<<<<<< HEAD
import { api, errorText, setToken } from "../lib/api";
=======
<<<<<<< HEAD
import { api, errorText, setToken } from "../lib/api";
=======
<<<<<<< HEAD
import { api, errorText, setToken } from "../lib/api";
=======
import { api, errorText } from "../lib/api";
import { Footer } from "../components/Common";
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2

export default function Login() {
  const { user, setUser, loading } = useAuth();
  const [captcha, setCaptcha] = useState(null),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    [error, setError] = useState(""),
    [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef(null);
  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
<<<<<<< HEAD
=======
=======
    [error, setError] = useState("");
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
  const [form, setForm] = useState({
    username: "",
    password: "",
    captcha_answer: "",
    remember: false,
  });
  const mx = useMotionValue(0),
    my = useMotionValue(0),
    x = useSpring(mx, { stiffness: 65, damping: 18 }),
    y = useSpring(my, { stiffness: 65, damping: 18 });
  const rotateY = useTransform(x, [-1, 1], [-12, 12]),
    rotateX = useTransform(y, [-1, 1], [8, -8]),
    translateX = useTransform(x, [-1, 1], [-16, 16]);
  const refresh = async () => {
    try {
      const r = await api.get("/auth/captcha");
      setCaptcha(r.data);
      setForm((f) => ({ ...f, captcha_answer: "" }));
<<<<<<< HEAD
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
=======
<<<<<<< HEAD
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    } catch (e) {
      setError("CAPTCHA belum dapat dimuat. Silakan coba kembali.");
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const update = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/auth/login", {
        ...form,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
        captcha_id: captcha?.id || "",
        recaptcha_token: recaptchaToken,
      });
      setToken(r.data.token);
<<<<<<< HEAD
=======
=======
        captcha_id: captcha.id,
      });
<<<<<<< HEAD
      setToken(r.data.token);
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
      setUser(r.data.user);
    } catch (e) {
      setError(errorText(e));
      refresh();
    } finally {
      setBusy(false);
    }
  };
  if (user && !loading) return <Navigate to="/" replace />;
  return (
    <div
      className="login-page"
      onMouseMove={(e) => {
        mx.set((e.clientX / window.innerWidth - 0.5) * 2);
        my.set((e.clientY / window.innerHeight - 0.5) * 2);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
      <header className="login-top">
        <a
          href="https://www.maiharta.com"
          target="_blank"
          rel="noreferrer"
          data-testid="login-brand-link"
        >
          <img
            src="/assets/logo.webp"
            alt="MaiHarta"
            className="brand-logo"
            data-testid="login-logo"
          />
        </a>
        <span className="login-top-note" data-testid="login-workspace-label">
          <span className="live-dot" /> Your next great project starts here.
        </span>
      </header>
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
      <main className="login-stage">
        <section className="login-visual">
          <div className="visual-grid" />
          <div className="login-visual-copy">
            <div className="brand-eyebrow" data-testid="login-eyebrow">
              <span /> CONNECT. CREATE. GROW.
            </div>
            <h1 data-testid="login-brand-title">
              Ide besar.
              <br />
              Kolaborasi <em>tanpa batas.</em>
            </h1>
            <p data-testid="login-tagline">
              Satu ruang untuk setiap langkah hebat Anda.
            </p>
          </div>
          <div className="barong-stage">
            <div className="barong-arch" />
            <div className="barong-orbit orbit-one" />
            <div className="barong-orbit orbit-two" />
            <motion.img
              data-testid="barong-image"
              className="barong-image"
              src="/assets/barong.webp"
              alt="Barong biru MaiHarta"
              style={{ rotateX, rotateY, x: translateX }}
            />
            <motion.div
              className="barong-tag tag-left"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <span className="tag-icon">
                <Check size={15} />
              </span>
              <div data-testid="barong-tag-collaboration">
                <b>Kolaborasi tanpa batas</b>
                <small>Bersama, wujudkan lebih.</small>
              </div>
            </motion.div>
            <motion.div
              className="barong-tag tag-right"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              data-testid="barong-tag-identity"
            >
              <span className="spark-symbol">✦</span> Bali roots. Global vision.
            </motion.div>
          </div>
          <div className="visual-bottom" data-testid="login-visual-bottom">
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
            <span data-testid="login-copyright">
              © {new Date().getFullYear()} CRM Maiharta
            </span>
            <span>
              <i />
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
            <span>CRAFTED WITH PURPOSE, ROOTED IN BALI.</span>
            <span>
              01 — 03 <i />
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              <i />
              <i />
            </span>
          </div>
        </section>
        <section className="login-form-panel">
          <div className="form-panel-inner">
            <div className="workspace-mark" data-testid="workspace-mark">
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              <img
                src="/assets/logo-mark.webp"
                alt="MaiHarta"
                className="mini-brand"
                data-testid="login-brand-mark"
              />
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
              <span className="mini-brand">
                M<span>H</span>
              </span>
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              <span>
                CRM <b>maiharta</b>
              </span>
              <span className="workspace-pill">WORKSPACE</span>
            </div>
            <div className="login-heading">
              <div
                className="welcome-eyebrow"
                data-testid="login-welcome-label"
              >
                SELAMAT DATANG KEMBALI
              </div>
              <h2 data-testid="login-title">
                Hal hebat dimulai
                <br />
                dari sini<span>.</span>
              </h2>
              <p data-testid="login-description">
                Masuk dan lanjutkan perjalanan project Anda.
              </p>
            </div>
            <form
              onSubmit={submit}
              className="login-form"
              data-testid="login-form"
            >
              <label className="login-field">
                <span>Username</span>
                <div className="input-with-icon">
                  <UserRound size={18} />
                  <input
                    data-testid="login-username"
                    name="username"
                    autoComplete="username"
                    placeholder="Masukkan username Anda"
                    value={form.username}
                    onChange={update}
                    required
                  />
                </div>
              </label>
              <label className="login-field">
                <span>Password</span>
                <div className="input-with-icon">
                  <LockKeyhole size={18} />
                  <input
                    data-testid="login-password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password Anda"
                    value={form.password}
                    onChange={update}
                    required
                  />
                  <button
                    data-testid="toggle-password"
                    type="button"
                    title={
                      visible ? "Sembunyikan password" : "Tampilkan password"
                    }
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <div className="captcha-block">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                {captcha?.provider === "recaptcha" ? (
                  <div className="login-field">
                    <span>Verifikasi keamanan</span>
                    <div className="recaptcha-wrap" data-testid="recaptcha-widget">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={captcha.site_key || siteKey}
                        hl="id"
                        onChange={(t) => setRecaptchaToken(t || "")}
                        onExpired={() => setRecaptchaToken("")}
                        onErrored={() =>
                          setError("reCAPTCHA belum dapat dimuat. Muat ulang halaman.")
                        }
                      />
                    </div>
                  </div>
                ) : (
<<<<<<< HEAD
=======
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                <label className="login-field">
                  <span>Verifikasi keamanan</span>
                  <div className="captcha-row">
                    <div
                      className="captcha-challenge"
                      data-testid="captcha-question"
                    >
                      {captcha?.question || "..."}
                    </div>
                    <button
                      type="button"
                      data-testid="refresh-captcha"
                      className="captcha-refresh"
                      onClick={refresh}
                      title="Ganti CAPTCHA"
                    >
                      <RotateCw size={17} />
                    </button>
                    <input
                      data-testid="captcha-answer"
                      aria-label="Jawaban CAPTCHA"
                      name="captcha_answer"
                      inputMode="numeric"
                      placeholder="Jawaban"
                      value={form.captcha_answer}
                      onChange={update}
                      required
                    />
                  </div>
                </label>
<<<<<<< HEAD
                )}
=======
<<<<<<< HEAD
                )}
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              </div>
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={update}
                    data-testid="remember-me"
                  />{" "}
                  Ingat saya
                </label>
                <span
                  data-testid="login-help"
                  title="Hubungi Admin untuk mengatur ulang password"
                >
                  Lupa password?{" "}
                  <a
                    data-testid="contact-admin"
                    href="mailto:giselleharuka@gmail.com"
                  >
                    Hubungi admin
                  </a>
                </span>
              </div>
              {error && (
                <p
                  className="login-error"
                  role="alert"
                  data-testid="login-error"
                >
                  {error}
                </p>
              )}
              <Button
                data-testid="login-submit"
                type="submit"
                className="login-submit"
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                disabled={
                  busy ||
                  !captcha ||
                  (captcha.provider === "recaptcha" && !recaptchaToken)
                }
<<<<<<< HEAD
=======
=======
                disabled={busy || !captcha}
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              >
                {busy ? "Sedang masuk..." : "Masuk ke workspace"}
                <ArrowRight size={18} />
              </Button>
            </form>
            <div className="login-secure" data-testid="login-security-note">
              <ShieldCheck size={15} /> Ruang kerja aman untuk tim & client
              MaiHarta
            </div>
          </div>
          <div className="panel-bottom" data-testid="login-panel-bottom">
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
            <span>
              Design dan develop by{" "}
              <a
                href="https://www.maiharta.com"
                target="_blank"
                rel="noreferrer"
                data-testid="login-credit-link"
              >
                MaiHarta <ArrowUpRight size={12} />
              </a>
            </span>
          </div>
        </section>
      </main>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
            <span>Built for meaningful collaboration.</span>
            <ArrowUpRight size={16} />
          </div>
        </section>
      </main>
      <Footer />
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    </div>
  );
}
