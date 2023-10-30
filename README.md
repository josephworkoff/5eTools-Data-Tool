This program displays data from [5eTools](https://5e.tools/index.html), an [open source](https://github.com/TheGiddyLimit/TheGiddyLimit.github.io) rules repository for the game Dungeons & Dragons 5th edition.
The game publishes official rules and content across many books. This site aggregates them into one place.
This program scrapes data contained in JSON files in 5eTools' backend /data directory and allows the user to browse through it.

A brief explanation of the game itself can be found [here](https://dnd.wizards.com/basics-play).

This program provides an interface for browsing the game's character Races, Backgrounds, Feats, and Spells.

The server provides an API for querying the data and returning it as JSON. There are three similar endpoints per data type and one index, for a total of 13 routes. All are accessed through GET alone.

Each data type has the same API options, subsituting the desired data type. Using Race as an example:

/race/<int:raceid> : Fetches the complete JSON representation of a single race, requested by a numeric ID.

/races : Bulk query for filtering races through GET parameters. Results are paginated in groups of 10 by default. Returns an abbreviated JSON description of the race containing ID's, Names, and Sources, as well as metainfo on how many total races match those parameters, the page number, how many are in this page, and how many pages worth of results there are.

/race/field/<string:field> : Returns a list of all distinct values that exist in the Collection for that field.

race(s) can be substituted for spell(s), background(s), and feat(s).
