import { create } from "zustand";

export const useSurveyStore = create((set) => ({
  answers: {}, // Guardará { "s1_causa": "texto", ... }
  userEmail: "", // Guardará el email del usuario
  interviewEmail: "",

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),

  setInterviewEmail: (email) => set({ interviewEmail: email }),
  setUserEmail: (email) => set({ userEmail: email }),

  // Esto lo usaremos cuando conectemos con Google Sheets
  resetSurvey: () => set({ answers: {}, interviewEmail: "", userEmail: "" }),
}));
