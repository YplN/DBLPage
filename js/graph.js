class Author {
    constructor(pid, name) {
        this.pid = pid;
        this.name = name;
        var withNoDigits = name.replace(/[0-9]/g, '');
        this.shortName = withNoDigits.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '');
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
    constructor(key, type, pids) {
        this.pids = pids;
        this.type = type;
        this.keypub = key;
    }

}



class Graph {
    constructor() {
        this.Authors = new Map();
        this.Publications = new Map();
        this.Collabs = [];
    }

    addAuthor(pid, name) {
        this.Authors.set(pid, new Author(pid, name));
    }

    authorExists(pid) {
        return this.Authors.has(pid);
    }


    addPublication(key, type, pids) {
        this.Publications.set(key, new Publication(key, type, pids));
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

}

let G = new Graph();