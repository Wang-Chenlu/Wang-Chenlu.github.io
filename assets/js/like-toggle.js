(function () {
  var storagePrefix = "chenlu-like-liked";
  var initialized = false;

  function getLikeKey(button) {
    return (button.getAttribute("data-like-key") || "home").trim() || "home";
  }

  function getStorageKey(key) {
    return key === "home" ? "chenlu-home-liked" : storagePrefix + ":" + key;
  }

  function getEndpoint(button) {
    return (button.getAttribute("data-like-endpoint") || "").trim();
  }

  function readLiked(key) {
    try {
      return localStorage.getItem(getStorageKey(key)) === "true";
    } catch (error) {
      return false;
    }
  }

  function writeLiked(key) {
    try {
      localStorage.setItem(getStorageKey(key), "true");
    } catch (error) {
      // Keep the interaction usable even when localStorage is unavailable.
    }
  }

  function formatCount(count) {
    return new Intl.NumberFormat("en").format(count);
  }

  function setState(button, liked) {
    var label = button.querySelector(".author__like-label");

    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", liked ? "true" : "false");
    button.setAttribute("aria-label", liked ? "Liked this page" : "Like this page");

    if (label) {
      label.textContent = liked ? "Liked" : "Like";
    }
  }

  function setLoading(button, loading) {
    button.classList.toggle("is-loading", loading);
    button.disabled = loading;
  }

  function setCount(button, count) {
    var countElement = button.querySelector(".author__like-count");

    if (!countElement || !Number.isFinite(count)) {
      if (countElement) {
        countElement.hidden = true;
      }
      return;
    }

    countElement.textContent = formatCount(count);
    countElement.hidden = false;
  }

  function buildCountUrl(endpoint, key) {
    var url = new URL(endpoint, window.location.origin);
    url.searchParams.set("key", key);
    return url.toString();
  }

  function readCount(endpoint, key) {
    return fetch(buildCountUrl(endpoint, key), {
      method: "GET",
      credentials: "omit"
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Could not read like count.");
      }
      return response.json();
    });
  }

  function sendLike(endpoint, key) {
    return fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key: key,
        action: "like"
      })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Could not save like.");
      }
      return response.json();
    });
  }

  function init() {
    var button = document.querySelector(".author__like");

    if (!button) {
      return;
    }

    initialized = true;

    var key = getLikeKey(button);
    var endpoint = getEndpoint(button);
    var liked = readLiked(key);
    var busy = false;

    setState(button, liked);

    if (endpoint) {
      readCount(endpoint, key)
        .then(function (data) {
          setCount(button, Number(data.count));
        })
        .catch(function () {
          setCount(button, NaN);
        });
    }

    button.addEventListener("click", function () {
      if (liked || busy) {
        return;
      }

      if (!endpoint) {
        liked = true;
        writeLiked(key);
        setState(button, liked);
        return;
      }

      busy = true;
      setLoading(button, true);

      sendLike(endpoint, key)
        .then(function (data) {
          liked = true;
          writeLiked(key);
          setState(button, liked);
          setCount(button, Number(data.count));
        })
        .catch(function () {
          setState(button, liked);
        })
        .finally(function () {
          busy = false;
          setLoading(button, false);
        });
    });
  }

  function boot() {
    if (initialized) {
      return;
    }

    if (document.querySelector(".author__like")) {
      init();
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    }
  }

  boot();

  if (!initialized && document.readyState !== "loading") {
    init();
  }
})();
