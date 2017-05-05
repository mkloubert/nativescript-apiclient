import ApiClient = require("nativescript-apiclient");
import Frame = require("ui/frame");
import { ListPicker } from "ui/list-picker";
import { Observable } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { Page } from "ui/page";
import { TextView } from "ui/text-view";
import TypeUtils = require("utils/types");

interface IFixIOResult {
    base: string;
    date: string;
    rates: IFixIOExchangeRates;
}

interface IFixIOExchangeRates {
    AUD?: number;
    BGN?: number;
    BRL?: number;
    CAD?: number;
    CHF?: number;
    CNY?: number;
    CZK?: number;
    DKK?: number;
    GBP?: number;
    HKD?: number;
    HRK?: number;
    HUF?: number;
    IDR?: number;
    ILS?: number;
    INR?: number;
    JPY?: number;
    KRW?: number;
    MXN?: number;
    MYR?: number;
    NOK?: number;
    NZD?: number;
    PHP?: number;
    PLN?: number;
    RON?: number;
    RUB?: number;
    SEK?: number;
    SGD?: number;
    THB?: number;
    TRY?: number;
    USD?: number;
    ZAR?: number;
}

export function createViewModel(page: Page) {
    var targetCurrencies = <ListPicker>page.getViewById("targetCurrencies");

    console.log("targetCurrencies: " + targetCurrencies);

    var amount = <TextView>page.getViewById("amount");

    var viewModel: any = new Observable();
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

            client.addLogger((msg) => {
                console.log("[" + ApiClient.LogSource[msg.source] + "]: " + msg.message);
            });

            client.ok((ctx) => {
                var result = ctx.getJSON<IFixIOResult>();

                ctx.dbg("OK: base: " + result.base);
                ctx.dbg("OK: date: " + result.date);

                var ta;
                if (!TypeUtils.isNullOrUndefined(result.rates[targetCurrency])) {
                    ta = result.rates[targetCurrency];
                }

                viewModel.set("targetAmount", ta * a);

                ctx.dbg("OK: target amount: " + viewModel.get("targetAmount"));
            }).complete((ctx) => {
                ctx.dbg("Completed call of: " + ctx.request.url);
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
