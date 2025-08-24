import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SearchProvider } from "../context/SearchContext";
import { Toaster } from "react-hot-toast";
import { ProgressProvider } from "../context/ProgressContext";
import { StudentCoursesProvider } from "../context/StudentCoursesContext";

export default function App({ Component, pageProps }: AppProps) {
   return (
    <ProgressProvider>
      <SearchProvider>
        <StudentCoursesProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Component {...pageProps} />
        </StudentCoursesProvider>
      </SearchProvider>
    </ProgressProvider>
  );
}
