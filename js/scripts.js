let url = getDBLPUrl(myPID) + ".xml";

const list = document.getElementById("list_publications_container");
const nameDOM = document.getElementById("name");
const submitDOM = document.getElementById("submitPID");
const pidDOM = document.getElementById("pid");

submitDOM.addEventListener('click', loadData);

function loadData() {
    const pid = pidDOM.value;
    createCytoscape(pid);
}


function createCytoscape(pid) {
    const url = getDBLPUrl(pid) + ".xml";
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const G = new Graph(xml);
            nameDOM.innerHTML = G.name;


            document.getElementById("co_authors_container").innerHTML="";
            for(const co_pid of G.Authors.keys()){
                if(co_pid != pid){
                    G.createAuthorDOM(co_pid);
                }
            }

            document.getElementById("list_publications_container").innerHTML="";
            for(const keypub of G.Publications.keys()){
                G.createPubliDOM(keypub);
            }

            let cy = setupCytogen();
            initCytoscape(cy, G);
            var layout = cy.elements().layout(cose_options);
            layout.run();


        })
        .catch(console.error);
}

function setupCytogen() {
    let cy = cytoscape({
        container: document.getElementById('cy'), // container to render in

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(label)',
                    'font-family': 'serif'
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

    cy.userZoomingEnabled(false);


    return cy;

}


const cose_options = {
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

function initCytoscape(cy, G) {

    const authors = G.getCytoscapeAuthors();
    const publications = G.getCytoscapePublications();
    const collabs = G.getCytoscapeCollabs();

    cy.add(authors);
    cy.add(publications);
    cy.add(collabs);


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

            // list.innerHTML = "";
            // const dom = G.createPubliDOM(this.id());
            // list.appendChild(dom)

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


        // list.innerHTML = "";
    });

    cy.on('mouseover', 'edge', function(e) {
        // var sel = e.target;
        // console.log(sel.classes())
        // if (sel.classes().includes("collab_edge")) {
        //     console.log(sel.id())
        // }
    });

    cy.on('click', 'node', function(e) {
        var sel = e.target;
        if (sel.classes().includes("author_node")) {
            // console.log(G.Authors.get(this.id()));
            list.innerHTML = "";
            cy.elements().remove();
            createCytoscape(G.Authors.get(this.id()).pid);

        }
        else if (sel.classes().includes("publi")) {
            list.innerHTML = "";
            const dom = G.createPubliDOM(this.id());
            list.appendChild(dom);
        }

    })

    cy.on('click', function(e) {
        var evtTarget = e.target;
        if( evtTarget === cy ){
            list.innerHTML = "";
            document.getElementById("list_publications_container").innerHTML="";
            for(const keypub of G.Publications.keys()){
                G.createPubliDOM(keypub);
            }
        }
    })
}