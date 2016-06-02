"use strict";
var ViewModel = require("./main-view-model");
function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel.createViewModel(page);
}
exports.onNavigatingTo = onNavigatingTo;
//# sourceMappingURL=main-page.js.map