export class BuildConfig {
  constructor() {
    this.setup_handlers();
    this.base_query = `https://v2.jokeapi.dev/joke/Any?type=single`;

    this.config = {
      lang: "us",
      categories: {
        any: true,
        programming: false,
        misc: false,
        dark: false,
        pun: false,
        spooky: false,
        christmas: false,
      },
      flags: {
        nsfw: false,
        religious: false,
        political: false,
        racist: false,
        sexist: false,
        explicit: false,
      },
    };
  }

  makeQuery = () => {
    const { lang } = this.config;
    const [c, f] = this.getCurrentFilters();

    let isAny = c.includes(Object.keys(this.config.categories)[0]);

    const category_string = isAny ? "Any" : c.join(",");
    const lang_string =
      lang === "en" ? (!f.length ? "?" : "?") : `?lang=${lang}&`;
    const flag_string = !f.length
      ? ""
      : lang === "en"
      ? `blacklistFlags=${f.join(",")}&`
      : `blacklistFlags=${f.join(",")}&`;

    this.base_query = `https://v2.jokeapi.dev/joke/${category_string}${lang_string}${flag_string}type=single`;
    console.log(this.base_query);
  };

  setup_handlers = () => {
    this.handleSelect();
  };

  getCurrentFilters = () => {
    return Object.entries(this.config)
      .slice(1)
      .map(([, f]) =>
        Object.entries(f)
          .filter(([key, value]) => value === true)
          .map(([key]) => key)
      );
  };

  // Insert an object (not entire object) that updates in-place the config object.
  updateConfig = (newConfig) => {
    this.config = { ...this.config, ...newConfig };
    this.makeQuery();
  };

  handleSelect = () => {
    const styledSelect = document.getElementById("styled-select");
    const optionsList = document.getElementById("options-list");
    const realSelect = document.getElementById("real-select");

    styledSelect.addEventListener("click", () => {
      optionsList.style.display = optionsList.classList.toggle("show");
    });

    optionsList.addEventListener("click", (event) => {
      const selectedOption = event.target.closest("li");
      if (selectedOption) {
        const { lang } = selectedOption.dataset;

        realSelect.value = lang;
        this.updateConfig({ lang });
        styledSelect.textContent = selectedOption.textContent;
        optionsList.classList.toggle("show");
      }
    });

    realSelect.addEventListener("change", () => {
      styledSelect.textContent = realSelect.value;

      optionsList.style.display = optionsList.classList.remove("show");
    });
  };

  getBuildQuery = () => {
    return this.base_query;
  };

  getConfig = () => {
    return this.config;
  };
}
