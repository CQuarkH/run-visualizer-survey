import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSurveyStore } from "./store/surveyStore";
import surveyData from "./data/questions.yml";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyspezjWJ00XFebo760MbYSlZSklV_pRQU_IDYbMfL3jKoPZEexAc-mzt3Y0Mroa4gn3Q/exec";

const ConsentPage = () => {
  const navigate = useNavigate();
  // Traemos el email y la función para guardarlo del store
  const { userEmail, setUserEmail } = useSurveyStore();

  // Validación simple de email
  const isValidEmail = userEmail.includes("@") && userEmail.includes(".");

  return (
    <div className="container">
      <div className="card">
        <h1>Participación en Experimento: Run Visualizer</h1>
        <p>
          Gracias por participar. Para comenzar, necesitamos tu correo
          electrónico.
        </p>

        {/* --- NUEVO INPUT --- */}
        <div style={{ margin: "2rem 0" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Tu Correo Electrónico:
          </label>
          <input
            type="email"
            placeholder="ejemplo@universidad.cl"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={{
              padding: "0.8rem",
              width: "100%",
              boxSizing: "border-box",
              border: isValidEmail ? "2px solid #10b981" : "1px solid #cbd5e1",
            }}
          />
        </div>
        {/* ------------------- */}

        <p>
          <small>
            <strong>Términos:</strong> Sus respuestas serán asociadas a este
            correo para fines de validación del experimento.
          </small>
        </p>

        <button
          className="btn"
          onClick={() => navigate("/instructions")}
          disabled={!isValidEmail} // Bloquea el botón si no hay email
          style={{
            opacity: isValidEmail ? 1 : 0.5,
            cursor: isValidEmail ? "pointer" : "not-allowed",
          }}
        >
          Acepto y Continuar
        </button>
      </div>
    </div>
  );
};

// --- PAGINA 2: INSTRUCCIONES ---
const InstructionsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="card">
        <h2>Instrucciones</h2>
        <p>
          Se le presentarán una serie de imágenes de la herramienta{" "}
          <strong>Run Visualizer</strong>.
        </p>
        <p>
          Para cada imagen, por favor analice el fallo y responda las preguntas
          subsecuentes.
        </p>
        <button className="btn" onClick={() => navigate("/survey/0")}>
          Comenzar Encuesta
        </button>
      </div>
    </div>
  );
};

// --- PAGINA 3: ENCUESTA (DINÁMICA) ---
const SurveyStepPage = () => {
  const { stepIndex } = useParams();
  const navigate = useNavigate();
  const index = parseInt(stepIndex);
  const data = surveyData[index];
  const { answers, setAnswer } = useSurveyStore();

  if (!data) return <div>Cargando...</div>;

  const handleNext = () => {
    // Aquí podrías validar que respondió antes de avanzar
    if (index < surveyData.length - 1) {
      navigate(`/survey/${index + 1}`);
    } else {
      navigate("/summary");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return import.meta.env.BASE_URL + cleanPath;
  };

  return (
    <div className="container">
      <p style={{ color: "#64748b" }}>
        Escenario {index + 1} de {surveyData.length}
      </p>

      <div className="card">
        <h2>{data.title}</h2>
        <p>{data.description}</p>

        {/* Renderizado de Imagen/GIF */}
        <div className="media-container" style={{ marginBottom: "2rem" }}>
          {/* Fallback si no encuentra la imagen */}
          <img
            src={getImageUrl(data.mediaSrc)}
            alt="Escenario del experimento"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/600x400?text=Imagen+No+Encontrada")
            }
          />
        </div>

        {/* Renderizado de Preguntas */}
        <div className="questions-form">
          {data.questions.map((q) => (
            <div key={q.id} style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontWeight: "bold", display: "block" }}>
                {q.text}
              </label>

              {q.type === "text" && (
                <textarea
                  rows={3}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                />
              )}

              {q.type === "scale" && (
                <div className="scale-options">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <label key={val}>
                      <input
                        type="radio"
                        name={q.id}
                        value={val}
                        checked={answers[q.id] == val}
                        onChange={() => setAnswer(q.id, val)}
                      />
                      {val}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="btn" onClick={handleNext}>
          {index === surveyData.length - 1
            ? "Finalizar y Revisar"
            : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

const SummaryPage = () => {
  const navigate = useNavigate();
  const { answers, userEmail } = useSurveyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      email: userEmail,
      fecha: new Date().toISOString(),
      ...answers,
      userAgent: navigator.userAgent,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      navigate("/closing");
    } catch (error) {
      console.error("Error enviando:", error);
      alert("Error al enviar. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Función auxiliar para encontrar el texto de la respuesta si es escala
  const getAnswerLabel = (val) => {
    // Si quieres personalizar (ej: 1 = Muy inseguro), hazlo aquí.
    // Por ahora devolvemos el valor tal cual.
    return val;
  };

  return (
    <div className="container">
      <div className="card">
        <h2
          style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}
        >
          Resumen de Respuestas
        </h2>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Por favor revisa tus respuestas antes de enviar.
        </p>

        {/* INFORMACIÓN DEL USUARIO */}
        <div
          style={{
            background: "#eff6ff",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <span style={{ fontWeight: "600", color: "#1e40af" }}>
            {userEmail}
          </span>
        </div>

        {/* ITERAMOS SOBRE EL YAML ORIGINAL PARA MANTENER EL ORDEN Y TEXTOS REALES */}
        <div className="summary-content">
          {surveyData.map((scenario, index) => (
            <div key={scenario.id} style={{ marginBottom: "2rem" }}>
              {/* Título del Escenario */}
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "#334155",
                  background: "#f1f5f9",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  margin: "0 0 1rem 0",
                }}
              >
                {index + 1}. {scenario.title}
              </h3>

              {/* Preguntas del Escenario */}
              <div style={{ paddingLeft: "1rem" }}>
                {scenario.questions.map((q) => (
                  <div key={q.id} style={{ marginBottom: "1.2rem" }}>
                    {/* Texto real de la pregunta (NO EL ID) */}
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {q.text}
                    </div>

                    {/* La respuesta del usuario */}
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#0f172a",
                        padding: "0.5rem",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        minHeight: "24px", // Para que no colapse si está vacío
                      }}
                    >
                      {answers[q.id] ? (
                        getAnswerLabel(answers[q.id])
                      ) : (
                        <em style={{ color: "#94a3b8" }}>Sin respuesta</em>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "2rem",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "2rem",
          }}
        >
          <button
            className="btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={
              isSubmitting
                ? {
                    opacity: 0.6,
                    cursor: "not-allowed",
                    width: "100%",
                    padding: "1rem",
                    animation: "pulse 2s infinite",
                  }
                : { width: "100%", padding: "1rem" }
            }
          >
            {isSubmitting
              ? "Enviando respuestas..."
              : "Confirmar y Enviar Encuesta"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Modifica el ClosingPage para enviar el email también
const ClosingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useSurveyStore();
  const [interviewRequested, setInterviewRequested] = useState(false);

  const handleInterest = async () => {
    // Reutilizamos el email que ya nos dieron al inicio
    const payload = {
      email: userEmail,
      interes_entrevista: "SI",
      fecha: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setInterviewRequested(true);
    } catch (e) {
      console.error(e);
      alert("Hubo un pequeño error de conexión, pero gracias por tu interés.");
    } finally {
      setIsLoading(false);
    }

    setInterviewRequested(true);
  };

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ color: "#10b981" }}>¡Gracias!</h1>
        <p>
          Respuestas registradas para: <strong>{userEmail}</strong>
        </p>

        {!interviewRequested ? (
          <div
            style={{
              marginTop: "2rem",
              borderTop: "1px solid #eee",
              paddingTop: "2rem",
            }}
          >
            <p>
              ¿Estarías disponible para una breve entrevista de seguimiento?
            </p>
            <button
              className="btn btn-outline"
              style={
                isLoading
                  ? {
                      cursor: "not-allowed",
                      opacity: 0.6,
                      animation: "pulse 2s infinite",
                    }
                  : {}
              }
              onClick={handleInterest}
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "Sí, me interesa"}
            </button>
          </div>
        ) : (
          <p style={{ marginTop: "2rem", color: "#2563eb" }}>
            ¡Anotado! Gracias por tu disposición.
          </p>
        )}
      </div>
    </div>
  );
};

// --- RUTEO PRINCIPAL ---
function App() {
  return (
    <BrowserRouter basename="/run-visualizer-survey">
      <Routes>
        <Route path="/" element={<ConsentPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/survey/:stepIndex" element={<SurveyStepPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/closing" element={<ClosingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
