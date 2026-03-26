import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import { isDevelopment, isProduction } from "./config/env";
import { getActiveSession, onAuthStateChange } from "./services/auth";
import { isSupabaseConfigured } from "./services/supabase";
import { authHydrate, authSetError } from "./store/store";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isProduction && !isSupabaseConfigured) {
      dispatch(authHydrate(null));
      return undefined;
    }

    let mounted = true;

    const hydrateSession = async () => {
      try {
        const session = await getActiveSession();
        if (mounted) {
          dispatch(authHydrate(session));
        }
      } catch (error) {
        if (mounted) {
          dispatch(
            authSetError(
              error.message ||
                (isDevelopment
                  ? "Unable to initialize local development auth."
                  : "Unable to connect to Supabase."),
            ),
          );
          dispatch(authHydrate(null));
        }
      }
    };

    hydrateSession();

    const subscription = onAuthStateChange((session) => {
      dispatch(authHydrate(session));
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return <Home />;
}

export default App;
