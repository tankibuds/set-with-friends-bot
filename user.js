// ==UserScript==
// @name         Set with Friends Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to bot the game Set with Friends
// @author       Aaron Tang
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @match        https://setwithfriends.com/game/*
// ==/UserScript==

(function() {
    'use strict';
    let delay = 1000, timeoutId;

    function Card(colour, shape, shading, number) {
        this.colour = colour;
        this.shape = shape;
        this.shading = shading;
        this.number = number;
    }

    let filter = function(cards) {
        let desired = [];
        cards.forEach(function(icon) {
            if (icon.style.visibility == "visible") {
                desired.push(icon);
            }
        });
        return desired;
    }

    let compareAttribute = function(attr1, attr2, attr3) {
        if (attr1==attr2 && attr1==attr3) return true;
        else if (attr1!=attr2 && attr1!=attr3 && attr2!=attr3) return true;
        else return false;
    }

    let checkSet = function(c1, c2, c3) {
        let colourSet = compareAttribute(c1.colour, c2.colour, c3.colour);
        let shapeSet = compareAttribute(c1.shape, c2.shape, c3.shape);
        let shadingSet = compareAttribute(c1.shading, c2.shading, c3.shading);
        let numberSet = compareAttribute(c1.number, c2.number, c3.number);
        return (colourSet && shapeSet && shadingSet && numberSet);
    }

    let findSet = function(cards) {
        let attrList = [];
        cards.forEach(function(icon) {
            let container = icon.children[0].children;
            //get number
            let number = container.length;
            //get shape
            let singleIcon = container[0].children;
            let shape = $(singleIcon[0]).attr("href").substring(1);
            //get shading
            let shading = "";
            if ($(singleIcon[0]).attr("fill") == "transparent") shading = "outlined";
            else if ($(singleIcon[0]).attr("mask") == "url(#mask-stripe)") shading = "striped";
            else shading = "filled";
            //get colour
            let colour = "";
            if ($(singleIcon[1]).attr("stroke") == "#008002") colour = "green";
            else if ($(singleIcon[1]).attr("stroke") == "#ff0101") colour = "orange";
            else colour = "purple";
            let newCard = new Card(colour, shape, shading, number);
            attrList.push(newCard);
        });
        let sz = attrList.length;
        for (let i = sz-1; i >=0; i--) {
            for (let j = i-1; j >=0; j--) {
                for (let k = j-1; k >=0; k--) {
                    if (!checkSet(attrList[i], attrList[j], attrList[k])) continue;
                    return [i,j,k];
                }
            }
        }
        console.log("Error: no set found");
    }

    let getDelay = function() {
        let radios = $('input[name="choice"]'), val = "";
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                val = radios[i].value;
                break;
            }
        }
        if (val == "Off") return -1;
        else if (val == "Slow") return 4000;
        else if (val == "Medium") return 2000;
        else if (val == "Fast") return 100;
        else console.log("error: no radio checked");
    }

    let run = function() {
        console.log(delay);
        let grid = $("div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded")[1];
        let cards = Object.values(grid.children);
        cards.shift();
        let clickableCards = filter(cards);
        let set = findSet(clickableCards);
        set.forEach(function(index) {
            //old code for highlighting a set but not clicking it
            //let jssHoverValue = "jss" + (+($(clickableCards[index].children[0]).attr("class").match(/\d+/)) + 2);
            //$(clickableCards[index].children[0]).addClass(jssHoverValue);
            $(clickableCards[index].children[0]).click();
        });
        delay = getDelay();
        timeoutId = setTimeout(run, delay);
    }

    let makeSpeed = function() {
        //class="MuiPaper-root jss30 MuiPaper-elevation1 MuiPaper-rounded"
        let timerPosition = $(".MuiDivider-root").first().parent();
        let e0 = timerPosition.parent(), speedPosition = $(timerPosition[0].cloneNode(false));
        speedPosition.css({"margin-top":"30px"});
        e0.append(speedPosition);
        speedPosition.append('<div class="container1"></div>');
        let e1 = $(".container1");
        e1.append('<form class="container2"></form>');
        let e2 = e1.children().first();
        e2.append('<input type="radio" name="choice" value="Off" checked="checked"> Off');
        e2.append('<input type="radio" name="choice" value="Slow"> Slow');
        e2.append('<input type="radio" name="choice" value="Medium"> Medium');
        e2.append('<input type="radio" name="choice" value="Fast"> Fast');
        $(".container2").css({"display":"flex", "justify-content":"center"});
        $(".container1").prepend('<h3 style="margin-top: 3px">Bot Speed</h3>').css({"text-align":"center"});
        $('input[name="choice"]').change(
            function() {
                delay = getDelay();
                clearTimeout(timeoutId);
                if (delay != -1) run();
                else delay = 10000000;
            }
        );
    }

    setTimeout(makeSpeed,1000);
})();
