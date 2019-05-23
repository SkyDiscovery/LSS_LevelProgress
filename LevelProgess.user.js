// ==UserScript==
// @name         LevelProgess
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Anzeige des Fortschritts (Dienstgrad und Credits bis zum nächsten Dienstgrad)
// @author       itsDreyter
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // array with all ranks ---------------------------------------------------
    var Ranks = [
        [0, "Anwärter(in)"],
        [200, "Feuerwehrmann/frau"],
        [10000,"Oberfeuerwehrmann/frau"],
        [100000,"Hauptfeuerwehrmann/frau"],
        [1000000,"Stv. Gruppenführer(in)"],
        [5000000,"Gruppenführer(in)"],
        [10000000,"Stv. Zugführer(in)"],
        [20000000,"Zugführer(in)"],
        [50000000,"Stv. Wehrführer(in)"],
        [100000000,"Wehrführer(in)"],
        [200000000,"Stv. Kreisbrandmeister(in)"],
        [500000000,"Kreisbrandmeister(in)"],
        [1000000000,"Stv. Landesbrandmeister(in)"],
        [2000000000,"Landesbrandmeister(in)"],
        [5000000000,"Ehrenmitglied"]
    ];

    // initially call it
    exec_show_progress();

    // always when credits are updated..
    var original_func = creditsUpdate;

    creditsUpdate = function(e){
        original_func.apply(this, arguments);

        exec_show_progress();
    }


    // main function ----------------------------------------------------------
    function exec_show_progress()
    {
        // initially remove existing
        delete_elements_progress();

        // get missing credits
        var int_missing = select_progess();

        if(int_missing <= 0) return;

        // get goal and rank
        var goal = get_goal(int_missing);

        // add html
        add_html_rank_progess(int_missing, goal);
    }

    // add html to nav bar for goal -------------------------------------------
    function add_html_rank_progess(int_missing, goal)
    {
        var navbar = $('#navbar-main-collapse');

        var li = document.createElement('li');
        li.setAttribute("class", "LevelProgressScript");

        var a = document.createElement('li');
        a.innerHTML = 'Nächster Rang: <b>' + goal[1] + '</b>';

        var progress = document.createElement('progress');
        progress.setAttribute("value", int_missing);
        progress.setAttribute("max", goal[0]);
        progress.setAttribute("id", "LevelProgressBar");
        progress.innerHTML = int_missing;

        var text = document.createElement('li');
        text.innerHTML = int_missing + ' von ' + goal[0];

        a.appendChild(progress);
        a.appendChild(text);

        li.appendChild(a);

        navbar[0].firstElementChild.insertBefore(li, navbar[0].firstElementChild.children[0]);
    }

    // get the goal he needs to archieve for the next rank --------------------
    function get_goal(int_missing)
    {
        for(var i = 0; i < Ranks.length; i++)
        {
            if(Ranks[i][0] < int_missing) continue;

            return Ranks[i];
        }
    }

    // get info from html side ------------------------------------------------
    function select_progess()
    {
        var flg_end = false;

        // read html side
        var response = $.ajax({
            type: "GET",
            url: "https://www.leitstellenspiel.de/level",
            async: false }).responseText.split('<div class="alert">');

        // check if we found something
        if (response == undefined || response == null) return;

        var match = response[1].match("noch")

        if(match == null) return;
        else match.index = match.index + 5;

        var value = '';

        // get the missing credits
        while(flg_end == false)
        {
            if(response[1].charAt(match.index) == '.')
            {
                match.index++;
                continue;
            }

            value = value + response[1].charAt(match.index);
            match.index++;

            if(/^\d+$/.test(response[1].charAt(match.index) == false)) flg_end = true;
            if(response[1].charAt(match.index) == ' ') flg_end = true;
        }

        return parseInt(value);
    }

    // delete elements ------------------------------------------------------
    function delete_elements_progress()
    {
        $('.LevelProgressScript').remove();
    }

})();