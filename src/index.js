import { ContentSearchService } from '@esri/hub-search';

const contentSearchService = new ContentSearchService({
   portal: "https://sccwrp.maps.arcgis.com/sharing/rest",
   isPortal: true
});

const urlStart = "https://hub.arcgis.com/maps/" // add id to end of this

window.addEventListener('DOMContentLoaded', () => {
   const searchButton = document.querySelector("#search-button");
   let saveButton = document.querySelector("#save-filter-button");

   const clear = document.querySelector("#search-clear");
   const textInput = document.querySelector("#search-field");
   
   let tagsCheckboxArray = document.querySelectorAll(".tags-checkbox");
   let tagsArray = [];

   let categCheckboxArray = document.querySelectorAll(".categ-checkbox");
   let categoriesArray = [];

   let itemTypeCheckboxArray = document.querySelectorAll(".item-type-checkbox")
   let itemTypesArray = [];

   let sortFieldButton = document.querySelector("#sort-button");
   let sortOrderButton = document.querySelector("#sort-order-button")

   // Search on ENTER key press
   textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
         e.preventDefault();
         searchButton.click();
      }
   });

   function search() {
      let gallery = document.querySelector("#search-gallery");
      gallery.innerHTML = "";
      console.log(">>>>>> Search:", textInput.value);

      let tags = getTags();
      let categories = getCategories();
      let itemTypes = getItemTypes()

      let sortField = sortFieldButton.value;
      let sortOrder = sortOrderButton.value;

      let filter = {
         "owner": "sccwrp",
         "terms": `${textInput.value}`,
         "tags": `${tags}`,
         "categories": `${categories}`
      }
      filter.type = itemTypes;

      let options = {
         "sortField": `${sortField}`,
         "sortOrder": `${sortOrder}`
      }

      contentSearchService.search({filter, options})
         .then(response => {
            console.log(response);
            response.results.forEach(result => {
               console.log("item type: ", result.hubType)
            })
            displayResults(response, gallery)
         });
   }

   // Changing what the gallery is sorted by
   document.querySelector("#sortby-rel").addEventListener("click", () => {
      sortFieldButton.value = "";
      search();
   })
   document.querySelector("#sortby-pop").addEventListener("click", () => {
      sortFieldButton.value = "numViews";
      search();
   })
   document.querySelector("#sortby-date").addEventListener("click", () => {
      sortFieldButton.value = "created";
      search();
   })

   sortOrderButton.addEventListener("click", () => {
      if (sortOrderButton.value == "asc") {
         sortOrderButton.value = "desc";
         search();
      } else {
         sortOrderButton.value = "asc"
         search();
      }
   })

   // Search handler
   searchButton.addEventListener("click", () => {
      search();
   })

   //Click search button to populate gallery with results
   searchButton.click();

   // Clear search event handler
   clear.addEventListener("click", () => {
      textInput.value = "";
   });

   // Filter handling

   // Tags
   function getTags() {
      tagsCheckboxArray.forEach(checkbox => {
         if (checkbox.checked) {
            tagsArray.push(checkbox.value);
         }
      })
      // Creating tags object for filter interface
      if (tagsArray.length > 0) {
         let tagsObjectString = "{";
         tagsArray.forEach((tag, i) => {
            if (i != tagsArray.length - 1) {
               tagsObjectString += `"${tag}", `;
            }
            else {
               tagsObjectString += `"${tag}"`;
            }
            i++;
         })
         tagsObjectString += '}'

         console.log("TAGS OBJECT STRING: ", tagsObjectString);
         tagsArray = [];
         return tagsObjectString;
      } else {
         return "";
      }
   }

   // Categories

   function getCategories() {
      categCheckboxArray.forEach(checkbox => {
         if (checkbox.checked) {
            categoriesArray.push(checkbox.value);
         }
      })
      // Creating tags object for filter interface
      if (categoriesArray.length > 0) {
         let categObjectString = "{";
         categoriesArray.forEach((category, i) => {
            if (i != categoriesArray.length - 1) {
               categObjectString += `"${category}", `;
            }
            else {
               categObjectString += `"${category}"`;
            }
            i++;
         })
         categObjectString += '}'

         console.log("CATEGORY OBJECT STRING: ", categObjectString);
         categoriesArray = [];
         return categObjectString;
      } else {
         return "";
      }
   }

   // Item Types

   function getItemTypes() {
      itemTypeCheckboxArray.forEach(checkbox => {
         if (checkbox.checked) {
            itemTypesArray.push(checkbox.value);
         }
      })
      // Creating tags object for filter interface
      if (itemTypesArray.length > 0) {
         let itemTypeObjectString = "{";
         itemTypesArray.forEach((itemType, i) => {
            if (i != itemTypesArray.length - 1) {
               itemTypeObjectString += `"${itemType}", `;
            }
            else {
               itemTypeObjectString += `"${itemType}"`;
            }
            i++;
         })
         itemTypeObjectString += '}'

         console.log("CATEGORY OBJECT STRING: ", itemTypeObjectString);
         itemTypesArray = [];
         return itemTypeObjectString;
      } else {
         return "";
      }
   }


   saveButton.addEventListener("click", () => {
      search();
   })   
});


// DISPLAY SEARCH RESULTS
const displayResults = (response, gallery) => {
   const searchResultsPage = document.createElement("div");
   searchResultsPage.classList.add("search-results-single-page");

   for (let i = 0; i < response.results.length; i++) {
      let title = response.results[i]["item"]["title"]
      let description = response.results[i]["item"]["description"]
      let dateCreated = response.results[i].createdDate;
      let tags = response.results[i]["item"]["tags"]
      let link = response.results[i]["item"]["id"]
      let numViews = response.results[i].numViews;
      
      let newCard = document.createElement("div");
      let thisCardId = "card" + link;
      newCard.id = thisCardId;
      newCard.classList.add("my-card-container")

      let theseTags = "| "
      tags.forEach(tag => {
         theseTags += tag + " | "
      });
      
      newCard.insertAdjacentHTML("beforeend", `
         <calcite-card style="height: 400px; width: 300px;">
            <h4>${title}</h4>
            <!-- <br>
            <h5>Description</h5>
            <p>The descriptions here are wonky, so I am putting in this placeholder text to... you guessed it! hold the place of the description. Hopefully these will get cleaned up so we can have something nice here.</p>
            <br> -->
            <h6>Date Created: <b>${dateCreated.toDateString()}</b></h6> 
            <h6>Tags</h6>
            <p>${theseTags}</p>
            <h6>Views: <b>${numViews}</b></h6>


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