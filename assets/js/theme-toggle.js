(function () {
  var storageKey = "theme";
  var root = document.documentElement;
  var mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var metaColors = {
    light: "#ffffff",
    dark: "#111315"
  };

  function storedTheme() {
    try {
      var theme = localStorage.getItem(storageKey);
      return theme === "dark" || theme === "light" ? theme : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Private browsing or strict storage settings can block localStorage.
    }
  }

  function preferredTheme() {
    return storedTheme() || (mediaQuery && mediaQuery.matches ? "dark" : "light");
  }

  function updateThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", metaColors[theme]);
    }
  }

  function updateToggle(theme) {
    var toggle = document.getElementById("theme-toggle");
    var control = toggle ? toggle.querySelector("a") || toggle : null;
    var icon = document.getElementById("theme-icon");
    var isDark = theme === "dark";

    if (control) {
      control.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      control.setAttribute("aria-pressed", String(isDark));
    }

    if (icon) {
      icon.classList.toggle("fa-moon", isDark);
      icon.classList.toggle("fa-sun", !isDark);
      icon.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function applyTheme(theme, persist) {
    var nextTheme = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", nextTheme);
    root.style.colorScheme = nextTheme;
    updateThemeColor(nextTheme);
    updateToggle(nextTheme);

    if (persist) {
      saveTheme(nextTheme);
    }

    if (typeof window.CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("site-theme-change", {
        detail: { theme: nextTheme }
      }));
    }
  }

  function bindToggle() {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) {
      return;
    }

    function onToggle(event) {
      event.preventDefault();
      var currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(currentTheme === "dark" ? "light" : "dark", true);
    }

    if (window.jQuery) {
      window.jQuery(toggle).off("click").on("click.siteTheme", onToggle);
    } else {
      toggle.addEventListener("click", onToggle);
    }

    applyTheme(preferredTheme(), false);
  }

  applyTheme(preferredTheme(), false);

  if (mediaQuery) {
    var onSystemThemeChange = function (event) {
      if (!storedTheme()) {
        applyTheme(event.matches ? "dark" : "light", false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(onSystemThemeChange);
    }
  }

  if (window.jQuery) {
    window.jQuery(function () {
      window.setTimeout(bindToggle, 0);
    });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.setTimeout(bindToggle, 0);
    });
  } else {
    window.setTimeout(bindToggle, 0);
  }

  window.siteTheme = {
    apply: function (theme) {
      applyTheme(theme, true);
    },
    current: function () {
      return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }
  };
})();
