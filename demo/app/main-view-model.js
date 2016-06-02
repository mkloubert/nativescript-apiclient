"use strict";
var ApiClient = require("nativescript-apiclient");
var observable_1 = require("data/observable");
var TypeUtils = require("utils/types");
function createViewModel(page) {
    var targetCurrencies = page.getViewById("targetCurrencies");
    console.log("targetCurrencies: " + targetCurrencies);
    var amount = page.getViewById("amount");
    var viewModel = new observable_1.Observable();
    viewModel.set("currencies", ["USD", "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "ZAR"]);
    viewModel.set("sourceAmount", 1.0);
    viewModel.set("targetAmount", undefined);
    targetCurrencies.selectedIndex = 0;
    viewModel.onCalculate = function () {
        try {
            var baseCurrency = "EUR";
            var targetCurrency = targetCurrencies.items[targetCurrencies.selectedIndex];
            var a = parseFloat(viewModel.get("sourceAmount"));
            if (isNaN(a) || a <= 0) {
                a = 1.0;
            }
            console.log("Base currency: " + baseCurrency);
            console.log("Target currency: " + targetCurrency);
            var client = ApiClient.newClient({
                baseUrl: "http://api.fixer.io",
                route: "{date}",
            });
            client.addLogger(function (msg) {
                console.log("[" + ApiClient.LogSource[msg.source] + "]: " + msg.message);
            });
            client.ok(function (ctx) {
                var result = ctx.getJSON();
                ctx.dbg("OK: base: " + result.base);
                ctx.dbg("OK: date: " + result.date);
                var ta;
                if (!TypeUtils.isNullOrUndefined(result.rates[targetCurrency])) {
                    ta = result.rates[targetCurrency];
                }
                viewModel.set("targetAmount", ta * a);
                ctx.dbg("OK: target amount: " + viewModel.get("targetAmount"));
            });
            client.get({
                params: {
                    base: baseCurrency,
                    symbols: targetCurrency
                },
                routeParams: {
                    date: "latest"
                }
            });
        }
        catch (e) {
            console.error("[ERROR] ViewModel >> onCalculate(): " + e);
        }
    };
    return viewModel;
}
exports.createViewModel = createViewModel;
//# sourceMappingURL=main-view-model.js.map