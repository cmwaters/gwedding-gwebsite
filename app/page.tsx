import { LanguageProvider } from "./i18n";
import { GuestProvider } from "./context/GuestContext";
import HomeContent from "./components/HomeContent";

export default function Home() {
  return (
    <GuestProvider guestGroup={null}>
      <LanguageProvider>
        <HomeContent />
      </LanguageProvider>
    </GuestProvider>
  );
}
