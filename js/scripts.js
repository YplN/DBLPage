$(document).ready(function() {

});


const BASE_URL_DBLP = "https://dblp.org/pid/";

const myPID = '203/9213'; // JT
// const myPID = '54/4758'; // SB
//const myPID = '61/8036'; //MP
// const myPID = '227/4719'; // TD
// const myPID = '203/8627'; // LI



function getDBLPUrl(pid) {
    return BASE_URL_DBLP + pid;
}

function getListPublications(xml) {
    return xml.getElementsByTagName("r");
}

function getTitleFromPublication(pub) {
    return pub.firstChild.getElementsByTagName("title")[0].innerHTML;
}

function getListAuthorsFromPublication(pub) {
    return pub.firstChild.getElementsByTagName("author");
}

function getPidFromAuthor(author) {
    return author.getAttribute("pid");
}

function getNameFromAuthor(author) {
    return author.innerHTML;
}

function getYearFromPublication(pub) {
    if (pub.firstChild.getElementsByTagName("year").length != 0)
        return pub.firstChild.getElementsByTagName("year")[0].innerHTML;
    return;
}

function getPubliTypeFromPublication(pub) {
    return pub.firstChild.nodeName;
}

function getPubliUrlFromPublication(pub) {
    if (pub.firstChild.getElementsByTagName("ee").length != 0)
        return pub.firstChild.getElementsByTagName("ee")[0].innerHTML;
    return;
}

function getKeyFromPublication(pub) {
    return pub.firstChild.getAttribute("key");
}

function getPublicationDBLPUrlFromKey(key) {
    return "https://dblp.org/rec/" + key + ".html";
}

function isArxiv(keyPub) {
    return keyPub.substr(0, 4) === 'abs-';
}

function formatLabel(keyPub) {
    if (!isArxiv(keyPub)) {
        return keyPub.replace(/[a-z]/g, '');
    } else {
        // return "ArX-" + keyPub.slice(4);
        return "CoRR";
    }
}

let url = getDBLPUrl(myPID) + ".xml";

let list = document.getElementById("list");



fetch(url)
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        const r_list = getListPublications(xml);

        for (const pub of r_list) {
            const liElem = document.createElement('li');
            const li = list.appendChild(liElem);
            li.innerHTML = "[" + getYearFromPublication(pub) + "] " + `<a href="` + getPubliUrlFromPublication(pub) + `">` + getTitleFromPublication(pub) + "</a> ";

            const listAuthorsElem = document.createElement("ul");
            const listAuthors = li.appendChild(listAuthorsElem);
            const keyPub = getKeyFromPublication(pub);
            const keyType = getPubliTypeFromPublication(pub);

            const pids = [];

            for (const a of getListAuthorsFromPublication(pub)) {
                const authorElem = document.createElement("li");
                const liAuthor = listAuthors.appendChild(authorElem);
                const authorPid = getPidFromAuthor(a);
                const authorName = getNameFromAuthor(a);
                liAuthor.innerHTML = `<a href="` + getDBLPUrl(authorPid) + `">` + authorName + "</a>";

                pids.push(authorPid);
                if (!G.authorExists(authorPid)) {
                    G.addAuthor(authorPid, authorName);
                }
            }
            G.addPublication(keyPub, keyType, pids);
            for (let i = 0; i < pids.length; i++) {
                for (let j = 0; j < i; j++) {
                    G.addCollab(pids[i], pids[j], keyPub);
                }
            }
        };

        var cy = cytoscape({

            container: document.getElementById('cy'), // container to render in

            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        'label': 'data(label)'
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#aaa',
                        'target-arrow-color': '#aaa',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                },

                {
                    selector: '.author_node',
                    style: {
                        'background-color': 'white',
                        'color': 'black',
                        "text-valign": "center",
                        "text-halign": "center",
                        "border-color": "black",
                        "border-width": "1px"
                    }
                },

                {
                    selector: '.inproceedings',
                    style: {
                        'background-color': '#196ca3',
                        // "border-color": "#1d5a82",
                        // "border-width": "4px"
                    }
                },
                {
                    selector: '.article',
                    style: {
                        'background-color': '#c32b72',
                        // "border-color": "#911037",
                        // "border-width": "4px"
                    }
                },
                {
                    selector: '.arxiv',
                    style: {
                        'background-color': '#606b70'
                    }
                },
                {
                    selector: '.phdthesis',
                    style: {
                        'background-color': '#f8c91f'
                    }
                },
                {
                    selector: '.publi',
                    style: {
                        'shape': 'square',
                        'width': '25px',
                        'height': '25px'
                    }
                },
                {
                    selector: '.collab_edge',
                    style: {
                        'width': 'data(weight)',
                        'line-color': '#ddd',
                        'target-arrow-shape': 'none',
                        'curve-style': 'bezier'
                    }
                },
                {
                    selector: 'node.highlight',
                    style: {
                        'border-color': '#000',
                        'border-width': '2px'
                    }
                },
                {
                    selector: 'node.semitransp',
                    style: { 'opacity': '0.5' }
                },
                {
                    selector: 'edge.highlight',
                    style: { 'mid-target-arrow-color': '#FFF' }
                },
                {
                    selector: 'edge.semitransp',
                    style: { 'opacity': '0.2' }
                }

            ],

            layout: {
                name: 'cose',
                rows: 1
            }

        });


        const authors = [];

        const publications = [];

        const collabs = [];


        G.Authors.forEach(author => {
            authors.push({
                group: 'nodes',
                data: {
                    id: author.pid,
                    label: author.shortName,
                },
                classes: "author_node",
                position: {
                    x: 1,
                    y: 1
                }
            });
        });

        G.Publications.forEach(pub => {
            publications.push({
                group: 'nodes',
                data: {
                    id: pub.keypub,
                    label: formatLabel(pub.keypub.split('/').slice(-1)[0]),
                    url: getPublicationDBLPUrlFromKey(pub.keypub)
                },
                classes: [isArxiv(pub.keypub.split('/').slice(-1)[0]) ? "arxiv" : pub.type, "publi"],
                position: {
                    x: 1,
                    y: 1
                }
            });

            // console.log(pub);
            pub.pids.forEach(pid => {
                publications.push({
                    group: 'edges',
                    data: {
                        id: pub.keypub + pid,
                        source: pid,
                        target: pub.keypub,
                    },
                    classes: ["publication_edge"]
                });
            });


        });

        G.Collabs.forEach(collab => {
            collabs.push({
                group: 'edges',
                data: {
                    id: collab.pids[0] + collab.pids[1],
                    source: collab.pids[0],
                    target: collab.pids[1],
                    weight: collab.getNumberCollabs()
                },
                classes: ["collab_edge"],

            });
        });


        var options = {
            name: 'cose',

            // Called on `layoutready`
            ready: function() {},

            // Called on `layoutstop`
            stop: function() {},

            // Whether to animate while running the layout
            animate: true,

            // The layout animates only after this many milliseconds
            // (prevents flashing on fast runs)
            animationThreshold: 250,

            // Number of iterations between consecutive screen positions update
            // (0 -> only updated on the end)
            refresh: 20,

            // Whether to fit the network view after when done
            fit: true,

            // Padding on fit
            padding: 30,

            // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            boundingBox: undefined,

            // Randomize the initial positions of the nodes (true) or use existing positions (false)
            randomize: false,

            // Extra spacing between components in non-compound graphs
            componentSpacing: 100,

            // Node repulsion (non overlapping) multiplier
            nodeRepulsion: function(node) { return 400000; },

            // Node repulsion (overlapping) multiplier
            nodeOverlap: 10,

            // Ideal edge (non nested) length
            idealEdgeLength: function(edge) { return 10; },

            // Divisor to compute edge forces
            edgeElasticity: function(edge) { return 100; },

            // Nesting factor (multiplier) to compute ideal edge length for nested edges
            nestingFactor: 5,

            // Gravity force (constant)
            gravity: 80,

            // Maximum number of iterations to perform
            numIter: 1000,

            // Initial temperature (maximum node displacement)
            initialTemp: 200,

            // Cooling factor (how the temperature is reduced between consecutive iterations
            coolingFactor: 0.95,

            // Lower temperature threshold (below this point the layout will end)
            minTemp: 1.0,

            // Pass a reference to weaver to use threads for calculations
            weaver: false
        };


        cy.add(authors);
        cy.add(publications);
        cy.add(collabs);

        cy.userZoomingEnabled(false);

        var layout = cy.elements().layout(options);
        layout.run();;


        cy.on('mouseover', 'node', function(e) {
            var sel = e.target;
            // console.log(sel.classes());
            if (sel.classes().includes("publi")) {
                cy.elements()
                    .difference(sel.outgoers()
                        .union(sel.incomers()))
                    .not(sel)
                    .addClass('semitransp');
                sel.addClass('highlight')
                    .outgoers()
                    .union(sel.incomers())
                    .addClass('highlight');
            } else if (sel.classes().includes("author_node")) {
                sel.addClass('highlight')
                    .outgoers()
                    .union(sel.incomers())
                    .addClass('highlight');
                cy.elements(".publi")
                    .addClass('semitransp');
                cy.elements()
                    .difference(sel.outgoers()
                        .union(sel.incomers()))
                    .not(sel)
                    .addClass('semitransp');
            }
        });
        cy.on('mouseout', 'node', function(e) {
            var sel = e.target;
            cy.elements()
                .removeClass('semitransp');
            sel.removeClass('highlight')
                .outgoers()
                .union(sel.incomers())
                .removeClass('highlight');
        });

        cy.on('mouseover', 'edge', function(e) {
            // var sel = e.target;
            // console.log(sel.classes())
            // if (sel.classes().includes("collab_edge")) {
            //     console.log(sel.id())
            // }
        });



    })
    .catch(console.error);