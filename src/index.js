import { ContentSearchService } from '@esri/hub-search';

const contentSearchService = new ContentSearchService({
   portal: "https://sccwrp.maps.arcgis.com/sharing/rest",
   isPortal: true
});

const filter = {
   "owner": "sccwrp"
}

const urlStart = "https://hub.arcgis.com/maps/" // add id to end of this

window.addEventListener('DOMContentLoaded', () => {
   const button = document.getElementById("search-button");
   const clear = document.querySelector("#search-clear");
   const textInput = document.querySelector("#search-field");

   // Search on ENTER key press
   textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
         e.preventDefault();
         button.click();
      }
   });

   // Search handler
   button.addEventListener("click", () => {
      let gallery = document.querySelector("#search-gallery");
      gallery.innerHTML = "";
      console.log(">>>>>> Search:", textInput.value);
      const filter = {
         "owner": "sccwrp",
         "terms": `${textInput.value}`
      }
      contentSearchService.search({ filter }, { aggregations: "12" })
         .then(response => {
            console.log(response)
            displayResults(response, gallery)
         })
   })

   // Clear search event handler
   clear.addEventListener("click", () => {
      textInput.value = "";
   });

});

// DISPLAY SEARCH RESULTSY
const displayResults = (response, gallery) => {
   const searchResultsPage = document.createElement("div");
   searchResultsPage.classList.add("search-results-single-page");

   for (let i = 0; i < response.results.length; i++) {
      let title = response.results[i]["item"]["title"]
      let description = response.results[i]["item"]["description"]
      let tags = response.results[i]["item"]["tags"]
      let link = response.results[i]["item"]["id"]
      
      let newCard = document.createElement("div");
      let thisCardId = "card" + link;
      newCard.id = thisCardId;
      newCard.classList.add("my-card-container")

      let theseTags = "| "
      tags.forEach(tag => {
         theseTags += tag + " | "
      });
      
      newCard.insertAdjacentHTML("beforeend", `
         <calcite-card style="height: 400px">
            <h2>${title}</h2>
            <h4>Description</h4>
            <p>The descriptions here are wonky, so I am putting in this placeholder text to... you guessed it! hold the place of the description. Hopefully these will get cleaned up so we can have something nice here.</p>
            <h4>Tags</h4>
            <p>${theseTags}</p>
         </calcite-card>
      `)
      newCard.addEventListener("click", () => {
         window.location.href = urlStart + link;
      })

      searchResultsPage.insertAdjacentElement("beforeend", newCard)
   }
   gallery.insertAdjacentElement("beforeend", searchResultsPage);
   gallery.insertAdjacentHTML("beforeend", "<div class='spacer'></div>")
   const previousButton = document.querySelector("#more-results");;
   if (previousButton) {
      console.log("removed")
      previousButton.remove();
   }
   createMoreResultsButton(response, gallery);
}


// CREATE MORE SEARCH RESULTS BUTTON
const createMoreResultsButton = (response, gallery) => {
   const buttonWrapper = document.createElement("div");
   buttonWrapper.classList.add("more-results-button-wrapper")
   
   const button = document.createElement("button")
   button.id = "more-results";
   button.classList.add("more-results-button")
   button.innerHTML = "Load more results"

   button.addEventListener("click", () => {
      const next = response.next();
      next.then(nextResponse => {
         displayResults(nextResponse, gallery)
      })
   })

   buttonWrapper.insertAdjacentElement("beforeend", button);
   gallery.insertAdjacentElement("beforeend", buttonWrapper);
}