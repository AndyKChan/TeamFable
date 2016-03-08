 $(document).ready(function() {
            document.onkeydown = function() 
                {
                    var j = event.keyIdentifier
                    if (j == "Right")
                        window.location = nextUrl
                    else if (j == "Left")
                        window.location = prevUrl            
                        }
                   });

$(document).ready(function() {
                    var nextPage = $("#next_page_link")
                    var prevPage = $("#previous_page_link")
                    nextUrl = nextPage.attr("href")
                    prevUrl = prevPage.attr("href")
});