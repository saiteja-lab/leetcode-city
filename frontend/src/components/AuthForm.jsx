import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { signInWithEmail, signUpWithEmail } from "../services/auth";
import { authClearFeedback, authRequestStart, authRequestSuccess, authSetError } from "../store/store";

function AuthForm() {
  const dispatch = useDispatch();
  const { submitting, error, message } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(authRequestStart());

    try {
      if (mode === "signup") {
        const result = await signUpWithEmail(email, password);

        if (result.session) {
          dispatch(authRequestSuccess("Account created and signed in."));
        } else {
          dispatch(
            authRequestSuccess(
              "Account created. Check your email if confirmation is enabled, then sign in.",
            ),
          );
        }
      } else {
        await signInWithEmail(email, password);
        dispatch(authRequestSuccess("Signed in successfully."));
      }

      setPassword("");
    } catch (submitError) {
      dispatch(
        authSetError(submitError.message || "Authentication failed. Please try again."),
      );
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            dispatch(authClearFeedback());
            setMode("signin");
          }}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            mode === "signin"
              ? "bg-cyan-400/15 text-cyan-200"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch(authClearFeedback());
            setMode("signup");
          }}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-cyan-400/15 text-cyan-200"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-white">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        {mode === "signin"
          ? "Sign in to generate your city and explore the community skyline."
          : "Create an account to save your LeetCode city to the shared board."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none transition focus:border-glow"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          minLength={6}
          required
          className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none transition focus:border-glow"
        />
        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-2xl bg-accent px-6 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
        >
          {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-3 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}
    </div>
  );
}

export default AuthForm;
