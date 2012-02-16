/* 
	paginate - create a pagination. default page size = 10. to override, pass { numPerPage: n }
	tblsort - creates a table sorter
	
*/

(function($) {

    function buildPagination($pager, currentPage, numPages, options, $table) {
        $pager.html("");

        var startPage = ((currentPage - 5) < 0 || (numPages <= 10)) ? 0 : (currentPage - 5);
        var endPage = (startPage + 10) > (numPages) ? (numPages) : (startPage + 10);
        if ((endPage - 10) < startPage && (endPage - 10) >= 0)
            startPage = (endPage - 10);


        if (startPage > 0) {
            $('<span class="page-number">|<<</span>')
                .bind('click', { 'newPage': 0 }, function(event) {
                    options.currentPage = event.data['newPage'];
                    buildPagination($pager, options.currentPage, numPages, options, $table);
                }).appendTo($pager);

            $('<span class="more">...</span>').appendTo($pager);
        }


        for (var page = startPage; page < endPage; page++) {
            var active = (page == currentPage) ? " active" : "";
            $('<span class="page-number' + active + '">' + (page + 1) + '</span>')
                .bind('click', { 'newPage': page }, function(event) {
                    options.currentPage = event.data['newPage'];
                    buildPagination($pager, options.currentPage, numPages, options, $table);
                }).appendTo($pager).addClass('clickable');
        }

        if (endPage < (numPages - 1)) {
            $('<span class="more">...</span>').appendTo($pager);
            $('<span class="page-number">>>|</span>')
                .bind('click', { 'newPage': (numPages - 1) }, function(event) {
                    options.currentPage = event.data['newPage'];
                    buildPagination($pager, options.currentPage, numPages, options, $table);
                }).appendTo($pager);
        }

        $table.trigger('repaginate');
    }

    $.fn.paginate = function(opt) {
        return this.each(function() {

            var _isLtIE8 = false;
            if (typeof (jQuery.browser.msie) != "undefined") {
                if (typeof (jQuery.browser.version) != "undefined") {
                    var version = parseFloat(jQuery.browser.version);
                    _isLtIE8 = (version < 8.00);
                }
            }

            var defaults = {
                currentPage: 0,
                numPerPage: 10,
                isLtIE8: _isLtIE8
            };

            var options = $.extend(defaults, opt);

            var $table = $(this);
            var $_rows = $table.find('tbody:first').children('tr');

            $table.bind('repaginate', function() {
                var startIndex = options.currentPage * options.numPerPage;
                var endIndex = (options.currentPage + 1) * options.numPerPage;

                $_rows.each(function(index, value) {
                    var idx = $(this).attr("rid");
                    if (typeof (idx) == "undefined")
                        idx = index;
                    if (idx >= startIndex && idx < endIndex) {
                        $(this).hide().show();
                        $(this).find("select").hide().show();
                    } else {
                        $(this).hide();
                        $(this).find("select").hide();
                    }
                });


            });

            var numRows = $_rows.length;
            var numPages = Math.ceil(numRows / options.numPerPage);

            if (numPages > 1) {

                var $pager = $table.find('div.pager');
                buildPagination($pager, options.currentPage, numPages, options, $table);
            }
        });
    }

    $.fn.tblsort = function(opt) {
        return this.each(function() {

            var _isLtIE8 = false;
            if (typeof (jQuery.browser.msie) != "undefined") {
                if (typeof (jQuery.browser.version) != "undefined") {
                    var version = parseFloat(jQuery.browser.version);
                    _isLtIE8 = (version < 8.00);
                }
            }

            var defaults = {
                imgUnsorted: "images/bg_w.gif",
                imgDescending: "images/desc_w.gif",
                imgAscending: "images/asc_w.gif",
                isLtIE8: _isLtIE8
            };

            var options = $.extend(defaults, opt);

            var $table = $(this);
            $('th', $table).each(function(column) {
                var findSortKey;

                if ($(this).is('.sort-alpha')) {
                    findSortKey = function($cell) {
                        return $cell.text().toUpperCase();
                    };
                } else if ($(this).is('.sort-numeric')) {
                    findSortKey = function($cell) {
                        var key = parseFloat($cell.text().toUpperCase().replace(/[-$,]/g, ''));
                        return isNaN(key) ? -1 : key;
                    };
                } else if ($(this).is('.sort-mask-number')) {
                    findSortKey = function($cell) {
                        var key = parseFloat($cell.text().toUpperCase().replace(/[-X]/g, ''));
                        return isNaN(key) ? -1 : key;
                    };
                } else if ($(this).is('.sort-mask-date')) {
                    findSortKey = function($cell) {
                        var t = $cell.text().toUpperCase().replace(/XX/g, '01');
                        if (t.length == 0) {
                            t = "01/01/1900";
                        }
                        else if (t.length == 4) {
                            t = "01/01/" + t;
                        }
                        var key = Date.parse(t);
                        return isNaN(key) ? -1 : key;
                    };
                } else if ($(this).is('.sort-link-alpha')) {
                    findSortKey = function($cell) {
                        return $cell.find('a').text().toUpperCase();
                    };
                } else if ($(this).is('.sort-date')) {
                    findSortKey = function($cell) {

                        var key = Date.parse($cell.text());
                        return isNaN(key) ? -1 : key;
                    }
                } else if ($(this).is('.sort-select')) {
                    findSortKey = function($cell) {

                        var key = $cell.find("select").val();
                        return isNaN(key) ? -1 : key;
                    }
                } else if ($(this).is('.sort-rank')) {
                    findSortKey = function($cell) {
                        var key = $cell.text();
                        return (key == null || key.length == 0) ? "zzzzz" : key;
                    }
                }

                if (findSortKey) {
                    $(this).addClass('clickable').hover(function() {
                        $(this).addClass('hover');
                    }, function() {
                        $(this).removeClass('hover');
                    }).click(function() {

                        var newDirection = 1;
                        if ($(this).is('.sorted-asc')) {
                            newDirection = -1;
                        }

                        var rows = $table.find('tbody:first').children('tr');

                        $.each(rows, function(index, row) {
                            row.sortKey = findSortKey($(row).children('td').eq(column));
                        });


                        rows.sort(function(a, b) {
                            if (a.sortKey < b.sortKey) return -newDirection;
                            if (a.sortKey > b.sortKey) return newDirection;
                            return 0;
                        });

                        $.each(rows, function(index, row) {
                            $(row).attr("rid", index);
                            $table.children('tbody').append(row);
                            row.sortKey = null;
                        });

                        var sortImage = options.imgUnsorted;
                        $table.find("th[class^='sort']").removeClass('sorted-asc').removeClass('sorted-desc');
                        $table.find("th[class^='sort'] img").each(function() {
                            this.src = sortImage;
                        });

                        var $sortHead = $table.find("th[class^='sort']").filter(':nth-child(' + (column + 1) + ')');
                        if (newDirection == 1) {
                            $sortHead.addClass('sorted-asc');
                            sortImage = options.imgAscending;
                        } else {
                            $sortHead.addClass('sorted-desc');
                            sortImage = options.imgDescending;
                        }
                        $sortHead.find('img').each(function() {
                            this.src = sortImage;
                        });

                        $table.find('td')
                              .removeClass('sorted')
                              .filter(':nth-child(' + (column + 1) + ')')
                              .addClass('sorted')

                        $table.trigger('repaginate');

                        if (options.isLtIE8) {
                            $table.find('select').hide('fast', function() {
                                $(this).show('fast');
                            });
                        }
                    });
                }
            });
        });
    }
})(jQuery);