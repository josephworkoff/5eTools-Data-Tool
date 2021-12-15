export const LIST_PAGE_BUTTONS = {
    first: $("<button>",
        {text:"|<",
         page:1,
        }
    ),
    prev: $("<button>",
        {text:"<",
         page:1,
        }
    ),
    next: $("<button>",
        {text:">",
         page:1,
        }
    ),
    last: $("<button>",
        {text:">|",
         page:1,
        }
    ),
}

Object.keys(LIST_PAGE_BUTTONS).forEach(key => {
    $("#listPageButtonsDiv").append(LIST_PAGE_BUTTONS[key]);
    LIST_PAGE_BUTTONS[key].hide();
});

