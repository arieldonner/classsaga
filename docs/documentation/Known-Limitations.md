# Known Limitations

## Current Limitations

- **Pet positioning is not per-pet adjustable**: all pets are centered vertically in the scene. Per-pet vertical offsets were explored but caused conflicts with existing CSS animations.
- **Animation offsets require a server restart and browser refresh**: pet animation positions are configured server-side in a config file. Changes require nodemon to restart and the browser to refresh before they take effect.
- **Pet stat decay is basic**: pet stats decay over time when neglected but the decay system is simple and not heavily tuned.
- **No admin interface**: shop items and pet types must be managed directly in the database. There is no admin UI for content management.
- **Single accessory and background slot**: only one accessory and one background can be equipped at a time.
- **Limited pet and item variety**: the MVP includes 3 pet species and a small set of shop items. Expanding content would require adding assets and database entries manually.
- **No email verification or password reset**: account registration does not verify email and there is no forgot password flow.
- **Mobile layout not optimized**: the app is designed for desktop use and has not been majorly tested or optimized for mobile screens outside of basic bootstrap classes.
- **No real multiplayer interaction**: students cannot interact with each other's pets or trade items. All gameplay is individual.
- **Limited pet AI behavior**: pets perform idle animations but do not react dynamically aside from preset animations for used care/items.
- **No persistent activity log**: the pet activity log is stored in the browser's local storage and is not saved to the database, meaning it is lost if the browser data is cleared.
- **Classroom integration is teacher-managed only**: there is no integration with existing platforms such as Canvas or Google Classroom. Teachers must manually manage students and point awards within the app.

