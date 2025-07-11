import { useState } from "react";
import { ConfigProvider, theme } from "antd";
import NameGenerator from "./pages/NameGenerator";

// 创建主题上下文
export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
        components: {
          Card: {
            boxShadowTertiary: isDarkMode
              ? "0 1px 2px 0 rgba(0, 0, 0, 0.3)"
              : "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          },
        },
      }}
    >
      <NameGenerator isDarkMode={isDarkMode} onThemeChange={toggleTheme} />
    </ConfigProvider>
  );
}

export default App;
