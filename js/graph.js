class Author {
    constructor(pid, name, url) {
        this.pid = pid;
        this.name = name;
        var withNoDigits = name.replace(/[0-9]/g, '');
        this.shortName = withNoDigits.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '');
        this.url = url;
    }

}

class Collab {
    constructor(pid1, pid2, key) {
        if (pid1 < pid2)
            this.pids = [pid1, pid2];
        else
            this.pids = [pid2, pid1];
        this.keypubs = [key];
    }


    getNumberCollabs() {
        return this.keypubs.length;
    }

    addCollab(key) {
        if (!this.Collabs[index].keypubs.includes(keypub)) {
            this.Collabs[index].keypubs.push(keypub);
        }
        return this.getNumberCollabs();
    }

}


class Publication {
    constructor(key, type, pids, year, url, title) {
        this.pids = pids;
        this.type = type;
        this.keypub = key;
        this.year = year;
        this.url = url;
        this.title = title;
    }

}



class Graph {
    // constructor() {
    //     this.Authors = new Map();
    //     this.Publications = new Map();
    //     this.Collabs = [];
    // }

    constructor(xml) {
        this.Authors = new Map();
        this.Publications = new Map();
        this.Collabs = [];


        const r_list = getListPublications(xml);

        for (const publication of r_list) {
            const keyPub = getKeyFromPublication(publication);
            const keyType = getPubliTypeFromPublication(publication);
            const yearPubli = getYearFromPublication(publication);
            const urlPubli = getPubliUrlFromPublication(publication);
            const titlePubli = getTitleFromPublication(publication);

            const pids = [];

            for (const a of getListAuthorsFromPublication(publication)) {
                const authorPid = getPidFromAuthor(a);
                const authorName = getNameFromAuthor(a);
                const authorURL = getDBLPUrl(authorPid);

                pids.push(authorPid);
                if (!this.authorExists(authorPid)) {
                    this.addAuthor(authorPid, authorName, authorURL);
                }
            }

            this.addPublication(keyPub, keyType, pids, yearPubli, urlPubli, titlePubli);

            for (let i = 0; i < pids.length; i++) {
                for (let j = 0; j < i; j++) {
                    this.addCollab(pids[i], pids[j], keyPub);
                }
            }
        };
    }

    createPubliDOM(keyPub) {
        if (this.Publications.has(keyPub)) {
            const publication = this.Publications.get(keyPub);

            const liElem = document.createElement('li');
            const liPubli = list.appendChild(liElem);
            liPubli.innerHTML = "[" + publication.year + "] " + `<a href="` + publication.url + `">` + publication.title + "</a> ";

            const listAuthorsElem = document.createElement("ul");
            const listAuthors = liPubli.appendChild(listAuthorsElem);

            for (const pid of publication.pids) {
                const a = this.Authors.get(pid);
                const authorElem = document.createElement("li");
                const liAuthor = listAuthors.appendChild(authorElem);
                //console.log('<a href="' + a.url + ">(" + a.shortName + ") " + a.name + "</a>");
                liAuthor.innerHTML = `<a href="${a.url}">(${a.shortName}) ${a.name}</a>`;
            }
            return liElem;
        }
        return null;
    }

    addAuthor(pid, name, url) {
        this.Authors.set(pid, new Author(pid, name, url));
    }

    authorExists(pid) {
        return this.Authors.has(pid);
    }


    addPublication(key, type, pids, year, url, title) {
        this.Publications.set(key, new Publication(key, type, pids, year, url, title));
    }

    addCollab(pid1, pid2, keypub) {
        if (pid1 > pid2) {
            return this.addCollab(pid2, pid1, keypub)
        } else {
            let index = getCollab(pid1, pid2);
            if (index != -1) {
                return this.Collabs[index].addCollab(keypub);
            } else {
                this.Collabs.push(new Collab(pid1, pid2, keypub));
                return 1;
            }
        }
    }

    numberCollabs(pid1, pid2) {
        let index = getCollab(pid1, pid2);
        if (index != -1)
            return this.Collabs[index].keypubs.length;
        else
            return 0;
    }

    getCollab(pid1, pid2) {
        if (pid2 < pid1)
            return this.getCollab(pid2, pid1);
        else
            for (let i = 0; i < this.Collabs.length; i++) {
                const c = this.Collabs[i];
                if (c.pids[0] === pid1 && c.pids[1] === pid2) {
                    return i;
                }
            }
        return -1;
    }

    addCollab(pid1, pid2, keypub) {
        let index = this.getCollab(pid1, pid2);
        if (index == -1) {
            this.Collabs.push(new Collab(pid1, pid2, keypub));
            return 1;
        } else {
            this.Collabs[index].keypubs.push(keypub);
        }
    }

    getCytoscapeAuthors() {
        const authors = [];

        this.Authors.forEach(author => {
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
        return authors;
    }

    getCytoscapePublications() {
        const publications = [];

        this.Publications.forEach(pub => {
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

        return publications;
    }

    getCytoscapeCollabs() {
        const collabs = [];
        this.Collabs.forEach(collab => {
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
        return collabs;
    }

}

// let G = new Graph();