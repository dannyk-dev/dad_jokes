import { BuildConfig } from "./queryBuilder";
import { Favorite } from "./favorites";

const jokeMessage = document.querySelector(".message");
// QMRmIyIdJQOJUkgB33CGm23oaF4rc8RN

class JokeApp {
  constructor(type) {
    this.type = type;
    this.setup_state();
    this.store = new Favorite();
    this.jokes = [];
    this.filters = [];
    this.currentJoke = {};
    this.loading = true;
    this.pos = 0;
    this.builder = new BuildConfig();
  }

  setup_state = () => {
    const btns = document.querySelectorAll(".card_actions-btn");

    btns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        await this.traverse_data(e.target);
      });
    });

    this.handleSave();
    this.modalController();
    this.handleReset();
    this.toggleConfigModal();
  };

  get_jokes = async () => {
    !this.loading && this.setLoading(true);

    try {
      const response = await fetch(this.builder.getBuildQuery(), {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch jokes");

      const data = await response.json();

      if (this.jokeExists(data.id)) return await this.get_jokes();

      this.setJoke({
        category: data.category,
        joke: data.joke,
        flags: data.flags,
        id: data.id,
      });
    } catch (err) {
      console.error("encontrei error a buscar piadas novas", err);
    }
  };

  traverse_data = async (target) => {
    switch (target.id) {
      case "nextt":
        await this.cycle_right(target);
        break;
      case "prev":
        await this.cycle_left(target);
        break;
    }
  };

  cycle_right = async (id) => {
    if (!this.jokes.length || this.pos === this.jokes.length - 1) {
      await this.get_jokes();
      return;
    }

    this.count_instances(id);
    jokeMessage.innerHTML = this.currentJoke.joke;
  };

  cycle_left = (id) => {
    if (this.pos <= 0) return;

    this.count_instances(id);
    jokeMessage.innerHTML = this.currentJoke.joke;
  };

  count_instances = (target) => {
    if (!this.jokes.length) return;
    const { dir } = target.dataset;

    this.pos = (this.pos + Number(dir)) % this.jokes.length;
    this.currentJoke = this.jokes[this.pos];
    this.updatePos();
  };

  setLoading = (status) => {
    this.loading = status;
    if (this.loading === true)
      jokeMessage.innerHTML = '<div class="lds-dual-ring"></div>';
  };

  setJoke = (jokeObject) => {
    if (!jokeObject.joke) {
      jokeMessage.innerHTML = "No Jokes for this Language or Category...";
      jokeMessage.classList.add("error");
      return;
    }

    this.setLoading(false);

    this.currentJoke = { ...jokeObject, isFavorite: false };
    this.jokes.push(this.currentJoke);

    jokeMessage.innerHTML = jokeObject.joke;
    jokeMessage.classList.contains("error") &&
      jokeMessage.classList.remove("error");

    this.pos = this.jokes.length - 1;
    this.updatePos();
  };

  handleSave = () => {
    const saveBtn = document.getElementById("save");
    saveBtn.addEventListener("click", async () => {
      this.currentJoke.isFavorite = !this.currentJoke.isFavorite;

      saveBtn.classList.add("animate__heartBeat");
      setTimeout(() => {
        saveBtn.classList.remove("animate__heartBeat");
      }, 250);

      this.currentJoke.isFavorite
        ? await this.store.setFavorite(this.currentJoke)
        : this.store.removeFavorite(this.currentJoke.id);

      this.store.toggleSave(this.currentJoke);
    });
  };

  handleReset = () => {
    const resetBtn = document.getElementById("reset");

    resetBtn.addEventListener("click", () => {
      this.jokes = [];
      this.currentJoke = {};
      this.pos = 0;
      this.updatePos();
      jokeMessage.innerHTML = "Press <b>´Next Joke´</b> to begin";
      document.getElementById("prev_counter").innerText = "";
      document.getElementById("next_counter").innerText = "";
      document.getElementById("save").classList.remove("favorite");
    });
  };

  toggleConfigModal = () => {
    const ovl = document.querySelector(".overlay");
    const cfm = document.querySelector(".config_modal");
    const cfBtn = document.getElementById("configBtn");

    ovl.addEventListener("click", () => {
      if (cfm.classList.contains("show")) {
        cfm.classList.remove("show");
        ovl.classList.remove("active");
        // this.updateConfig();
      }
    });

    cfBtn.addEventListener("click", () => {
      ovl.classList.add("active");
      cfm.classList.add("show");
      this.updateConfig();
      console.log(this.updates);
    });
  };

  updateConfig = () => {
    const category_filters = document.querySelectorAll(
      ".settings_category-filters .categories_wrapper input"
    );

    const categories = [...category_filters];

    category_filters.forEach((item) => {
      item.addEventListener("change", (e) => {
        console.log(e.target.id);
        this.filters.push({ [`${e.target.id}`]: e.target.checked });
      });
    });
  };

  modalController = () => {
    const modal = document.querySelector(".favorites_modal");

    modal.addEventListener("click", (e) => {
      switch (e.target.id) {
        case "modal":
          this.store.toggleModal();
          break;
        case "item":
          this.setJoke(this.store.getJoke(e.target.dataset.id));
          this.store.toggleModal();
          break;
        case "trash":
          const { id } = e.target.parentNode.dataset;

          this.jokes = this.jokes.map((item) => {
            if (item.id === Number(id)) {
              return {
                ...item,
                isFavorite: false,
              };
            }

            return item;
          });
          this.store.toggleSave(
            this.jokes.find((item) => item.id === Number(id))
          );
          this.store.removeFavorite(id);
          this.store.renderFavs();

          break;
      }
    });
  };

  updatePos = () => {
    document.getElementById("prev_counter").innerText = `(${this.pos})`;
    document.getElementById("next_counter").innerText = `(${
      this.jokes.length - 1 - this.pos
    })`;
    this.store.toggleSave(this.currentJoke);
  };

  jokeExists = (id) => {
    return this.jokes.some((item) => item.id === Number(id));
  };
}

window.addEventListener("DOMContentLoaded", () => {
  new JokeApp("random");
});
