export class Favorite {
  constructor() {
    this.favorites = this.loadData();
  }

  loadData = () => {
    if (localStorage.getItem("fav") !== null)
      return JSON.parse(localStorage.getItem("fav"));

    return [];
  };

  renderFavs = () => {
    const title = document.getElementById("modalTitle");
    const gallery = document.querySelector(".gallery_items");

    gallery.innerHTML = "";
    if (this.hasFavorites()) {
      title.innerText = "Your Jokes";
      title.classList.remove("empty");
    } else {
      title.innerText = "No Favorites saved...";
      title.classList.add("empty");
    }

    this.favorites.forEach((item) => {
      gallery.innerHTML += `
				<div class='gallery_items-item' id='item' data-id='${item.id}'>
					<div class='text_preview'>
						<p>${item.joke}</p>
					</div>
					<a href='#' class='trash_btn' id='trash'>
						<svg id='test' xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M6 7H5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7H6zm4 12H8v-9h2v9zm6 0h-2v-9h2v9zm.618-15L15 2H9L7.382 4H3v2h18V4z"></path></svg>
					</a>
				</div>
			`;
    });
  };

  setFavorite = (jokeObj) => {
    this.favorites.push(jokeObj);
    this.saveLocally();
  };

  toggleModal = () => {
    const card = document.querySelector(".card");
    const modal = document.querySelector(".favorites_modal");

    card.classList.toggle("hide");
    modal.classList.toggle("active");

    modal.classList.contains("active") && this.renderFavs();
  };

  removeFavorite = (id) => {
    this.favorites = this.favorites.filter((item) => item.id !== Number(id));
    this.saveLocally();
  };

  getJoke = (id) => {
    return this.favorites.find((item) => item.id === Number(id));
  };

  toggleSave = (jokeObj) => {
    if (!jokeObj || !this.hasFavorites()) return;
    const heart = document.getElementById("save");

    let isFavorite = false;

    for (let item of this.favorites) {
      if (!jokeObj in this.favorites || jokeObj.isFavorite) {
        isFavorite = true;
        break;
      }
    }

    isFavorite
      ? heart.classList.add("favorite")
      : heart.classList.remove("favorite");
  };

  saveLocally = () => {
    localStorage.setItem("fav", JSON.stringify(this.favorites));
  };

  hasFavorites = () => {
    if (this.favorites.length) return true;

    return false;
  };

  reset = () => {
    this.favorites = [];
    this.saveLocally();
  };
}
