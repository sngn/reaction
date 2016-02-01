packages = Router.group({
  name: "packages"
});

/**
 * registerPackageLayouts
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @returns {undefined} returns undefined
 */
Router.registerPackageLayouts = () => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  for (let pkg of pkgs) {
    for (let registryItem of pkg.registry) {
      // should we add a permissions check here?
      if (registryItem.route && registryItem.template) {
        // console.log(registryItem.route, registryItem.template);
        const segments = registryItem.route.split("/");
        let newRoute = registryItem.route;
        let isGroup = false;
        /*
          since all routes must start with "/"
          there will be magic in Reaction Registry
          where we'll assume that the first
          route segment is a group definition
          example:
          "dashboard/test" = dashboard group, test route.
          "/dashboard/test" = "/dashboard/test" route.
        */
        if (newRoute.substr(0, 1) !== "/") {
          isGroup = true; //
          newRoute = `${newRoute.replace(segments[0], "")}`;
        }
        // see if we can add to group
        if (segments.length > 1 && isGroup === true) {
          group = Router.group({prefix: "/" + segments[0]});
          group.route(newRoute, {
            name: registryItem.route,
            action: (context) => {
              renderLayout({
                template: registryItem.template
              });
            }
          });
        } else { // if path in registry starts with "/"
          Router.route(newRoute, {
            name: newRoute.replace("/", ""),
            action: (context) => {
              renderLayout({
                template: registryItem.template
              });
            }
          });
        }
      }
    }
  }
};

Meteor.startup(function () {
  Router.registerPackageLayouts();
});