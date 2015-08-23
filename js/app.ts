///<reference path='../typings/bundle.d.ts'/>

class Plan {
    name: string;
    monthlyPrice: number;
    streamProcessingHours: number;
    additionalHours: number;
    networkUsage: number;
    additionalNetworkUsage: number;
    recordingStorage: number;
    additionalStorage: number;
}

class Discount {
    next: number;
    price: number;
    constructor(next, price) {
        this.next = next;
        this.price = price;
    }
}

class PriceCalc {
    unitPrice: number;
    num: number;
    constructor(unitPrice, num) {
        this.unitPrice = unitPrice;
        this.num = num;
    }
    sum() { return this.unitPrice * this.num; }
}

class StreamProcessing {
    eventNum: number;
    monthlyPrice: number;
    monthlyHour: number;
    discounts: Discount[];
    constructor(eventNum, monthlyPrice, monthlyHour, discouts) {
        this.eventNum = eventNum;
        this.monthlyPrice = monthlyPrice;
        this.monthlyHour = monthlyHour;
        this.discounts = discouts;
    }
    sumHour() {
        return 24 * this.eventNum;
    }
    processingHours() {
        return this.eventNum * 24;
    }
    restHours() {
        return this.processingHours() - this.monthlyHour;
    }
    createPrices() {
        var restHours = this.restHours()
        var prices: PriceCalc[] = [];
        for (var i = 0; i < this.discounts.length; i++) {
            var discount = this.discounts[i];
            if (restHours <= discount.next) {
                prices.push(new PriceCalc(
                    discount.price,
                    restHours
                ));
                break;
            } else {
                if (i == this.discounts.length - 1) {
                    prices.push(new PriceCalc(
                        discount.price,
                        restHours
                    ));
                } else {
                    prices.push(new PriceCalc(
                        discount.price,
                        discount.next
                    ));
                    restHours -= discount.next;
                }
            }
        }
        return prices;
    }
    sumAdditionalPrice() {
        var prices = this.createPrices();
        var sum = 0;
        for (var i = 0; i < prices.length; i++) {
            sum += prices[i].sum();
        }
        return sum;
    }
}

class NetworkUsage {
    monthlyPrice: number;
    viewerNum: number;
    Gbps: number;
    monthlyUsageGB: number;
    discounts: Discount[];
    constructor(monthlyPrice, viewerNum, Gbps, monthlyUsageGB, discounts) {
        this.monthlyPrice = monthlyPrice;
        this.viewerNum = viewerNum;
        this.Gbps = Gbps;
        this.monthlyUsageGB = monthlyUsageGB;
        this.discounts = discounts;
    }
    sumUsageGB() {
        return this.Gbps * 24 * 60 * 60 * this.viewerNum;
    }
    sumAdditionalUsageGB() {
        return this.sumUsageGB() - this.monthlyUsageGB;
    }
    createPrices() {
        var prices: PriceCalc[] = [];
        var restUsage = this.restUsage();
        for (var i = 0; i < this.discounts.length; i++) {
            var discount = this.discounts[i];
            if (restUsage <= discount.next) {
                prices.push(new PriceCalc(
                    discount.price,
                    restUsage
                ));
                break;
            } else {
                prices.push(new PriceCalc(
                    discount.price,
                    discount.next
                ));
                restUsage -= discount.next;
            }
        }
        return prices;
    }
    sumAdditionalPrice() {
        var prices = this.createPrices();
        var sum = 0;
        for (var i = 0; i < prices.length; i++) {
            sum += prices[i].sum();
        }
        return sum;
    }
    restUsage() {
        return this.sumUsageGB() - this.monthlyUsageGB;
    }
}

module WowzaModule {
    export interface MainScope extends ng.IScope {
        bpsMB: number;
        eventNum: number;
        viewerNum: number;
        streamProcessing: StreamProcessing;
        streamProcessingPrices: PriceCalc[];
        networkUsage: NetworkUsage;
        networkUsagePrices: PriceCalc[];
        plans: Plan[];
        streamProcessingDiscounts: Discount[];
        networkUsageDiscounts: Discount[];
        recordingStorageDiscounts: Discount[];
        monthlyPrice: number;
        monthlyTotal: number;
        calculate: Function;
    }
    export class WowzaController {
        constructor(private $scope: MainScope) {
            $scope.bpsMB = 0.5;
            $scope.eventNum = 1;
            $scope.viewerNum = 1000;

            $scope.plans = [
                {
                    name: "Pay-as-You-Go Subscription",
                    monthlyPrice: 15,
                    streamProcessingHours: 2,
                    additionalHours: 6,
                    networkUsage: 10,
                    additionalNetworkUsage: 0.095,
                    recordingStorage: 0,
                    additionalStorage: 0.10
                },
                {
                    name: "10/100 Subscription",
                    monthlyPrice: 49,
                    streamProcessingHours: 10,
                    additionalHours: 5.50,
                    networkUsage: 100,
                    additionalNetworkUsage: 0.09,
                    recordingStorage: 50,
                    additionalStorage: 0.10
                },
                {
                    name: "50/2000 Subscription",
                    monthlyPrice: 299,
                    streamProcessingHours: 50,
                    additionalHours: 4.50,
                    networkUsage: 2000,
                    additionalNetworkUsage: 0.085,
                    recordingStorage: 250,
                    additionalStorage: 0.09
                },
                {
                    name: "100/5000 Subscription",
                    monthlyPrice: 599,
                    streamProcessingHours: 100,
                    additionalHours: 3.50,
                    networkUsage: 5000,
                    additionalNetworkUsage: 0.077,
                    recordingStorage: 500,
                    additionalStorage: 0.08
                }
            ];

            $scope.streamProcessingDiscounts = [
                {next:10, price:6},
                {next:20, price:5.50},
                {next:20, price:5},
                {next:50, price:4.50},
                {next:100, price:3.50},
                {next:300, price:3}
            ];

            $scope.networkUsageDiscounts = [
                {next:100, price:0.095},
                {next:900, price:0.09},
                {next:1500, price:0.085},
                {next:7500, price:0.077},
                {next:10000, price:0.069},
                {next:20000, price:0.062},
                {next:30000, price:0.055},
                {next:30000, price:0.049}
            ];

            $scope.recordingStorageDiscounts = [
                {next:1000, price:0.10},
                {next:4000, price:0.09},
                {next:15000, price:0.08},
            ];

            $scope.calculate = function() {
                var plan = $scope.plans[0];

                $scope.monthlyPrice = plan.monthlyPrice;

                $scope.streamProcessing = new StreamProcessing(
                    $scope.eventNum,
                    plan.monthlyPrice,
                    plan.networkUsage,
                    $scope.streamProcessingDiscounts
                );
                $scope.streamProcessingPrices = $scope.streamProcessing.createPrices();



                $scope.networkUsage = new NetworkUsage(
                    plan.monthlyPrice,
                    $scope.viewerNum,
                    $scope.bpsMB / 1000,
                    plan.networkUsage,
                    $scope.networkUsageDiscounts
                );
                $scope.networkUsagePrices = $scope.networkUsage.createPrices();


                $scope.monthlyTotal = $scope.monthlyPrice + $scope.streamProcessing.sumAdditionalPrice() + $scope.networkUsage.sumAdditionalPrice();
            };
        }
    }
}

var app = angular.module("Wowza", [])
app.controller("WowzaController", ['$scope', WowzaModule.WowzaController]);
