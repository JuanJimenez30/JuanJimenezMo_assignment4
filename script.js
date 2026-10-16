const gallery = document.getElementById("gallery");
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const message = document.getElementById("message");

// this is my default show search
window.onload = () => searchShows("naruto");

// Event listener for form submission
form.addEventListener("submit", e => {
    e.preventDefault();

    const query = input.value.trim();

    if (!query) {
        message.textContent = "Please enter a search term.";
        gallery.innerHTML = "";
        return;
    }

    searchShows(query);
});

function makeParagraph(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
}

async function searchShows(query) {
    gallery.innerHTML = "";
    message.textContent = "Loading...";

    try {
        const response = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) throw new Error();

        const data = await response.json();

        if (data.length === 0) {
            message.textContent = "No shows found.";
            return;
        }

        message.textContent = "";

        for (const item of data.slice(0, 10)) {
            const show = item.show;

            let cast = "Not available";

            try {
                const castResponse = await fetch(
                    `https://api.tvmaze.com/shows/${show.id}/cast`
                );

                const castData = await castResponse.json();

                if (castData.length) {
                    cast = castData
                        .slice(0, 5)
                        .map(c => c.person.name)
                        .join(", ");
                }
            } catch {}

            const card = document.createElement("div");
            card.classList.add("card");

            const img = document.createElement("img");
            img.src = show.image
                ? show.image.medium
                : "https://via.placeholder.com/210x295?text=No+Image";
            img.alt = `${show.name} poster`;

            const title = document.createElement("h2");
            title.textContent = show.name;

            const link = document.createElement("a");
            link.href = show.url;
            link.target = "_blank";
            link.textContent = "View on TVMaze";

            card.append(
                img,
                title,
                makeParagraph(
                    "Summary: " +
                    (show.summary
                        ? show.summary.replace(/<[^>]*>/g, "")
                        : "Not available")
                ),
                makeParagraph(
                    "Premiered: " +
                    (show.premiered || "Not available")
                ),
                makeParagraph(
                    "Last Updated: " +
                    (show.updated
                        ? new Date(show.updated * 1000).toLocaleString()
                        : "Not available")
                ),
                makeParagraph(
                    "Genres: " +
                    (show.genres.length
                        ? show.genres.join(", ")
                        : "Not available")
                ),
                makeParagraph(
                    "Rating: " +
                    (show.rating?.average || "Not available")
                ),
                makeParagraph("Cast: " + cast),
                link
            );

            gallery.appendChild(card);
        }
    } catch {
        message.textContent = "Error loading data.";
    }
}