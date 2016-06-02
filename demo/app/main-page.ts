import ViewModel = require("./main-view-model");

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel.createViewModel(page);
}
exports.onNavigatingTo = onNavigatingTo;
