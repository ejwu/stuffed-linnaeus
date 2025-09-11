document.addEventListener('DOMContentLoaded', () => {
    const mobileContainer = document.querySelector('.mobile-container');

    async function fetchData(filename) {
        try {
            const response = await fetch(`data/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return null;
        }
    }

    function createMobileElement(nodeData) {
        const mobileElement = document.createElement('div');
        mobileElement.classList.add('mobile-element');

        // Estimate width based on character count.
        const charCount = nodeData.name.length;
        const estimatedWidth = charCount * 8 + 40; // Adjusted for padding
        const finalWidth = Math.max(100, estimatedWidth);

        mobileElement.style.width = `${finalWidth}px`;

        // Randomize rotation speed
        const baseDuration = 10;
        const randomFactor = 0.9 + Math.random() * 0.2;
        const randomDuration = baseDuration * randomFactor;
        mobileElement.style.animationDuration = `${randomDuration}s`;

        const front = document.createElement('div');
        front.classList.add('front');
        front.style.padding = '0 10px';
        front.style.display = 'flex';
        front.style.flexDirection = 'column';
        front.style.justifyContent = 'center';
        front.style.alignItems = 'center';

        if (nodeData.frontImageUrl) {
            const img = document.createElement('img');
            img.src = nodeData.frontImageUrl;
            img.alt = nodeData.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            front.appendChild(img);
        } else {
            const label = document.createElement('div');
            label.classList.add('label');
            label.textContent = nodeData.name;
            label.style.whiteSpace = 'nowrap';
            front.appendChild(label);

            if (nodeData.backImageUrl && nodeData.level === 'species') {
                const baseFilename = nodeData.backImageUrl.split('/').pop().split('.').slice(0, -1).join('.');
                const filenameDiv = document.createElement('div');
                filenameDiv.classList.add('filename');
                filenameDiv.textContent = baseFilename;
                filenameDiv.style.fontSize = '10px';
                filenameDiv.style.color = '#888';
                front.appendChild(filenameDiv);
            }
        }

        mobileElement.appendChild(front);

        const back = document.createElement('div');
        back.classList.add('back');
        back.style.padding = '0 10px';

        if (nodeData.backImageUrl) {
            const img = document.createElement('img');
            img.src = nodeData.backImageUrl;
            img.alt = nodeData.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            back.appendChild(img);
        } else {
            const pictureText = document.createElement('div');
            pictureText.classList.add('picture-text');
            pictureText.textContent = "picture";
            pictureText.style.whiteSpace = 'nowrap';
            back.appendChild(pictureText);
        }
        mobileElement.appendChild(back);

        return mobileElement;
    }

    function buildTree(nodeData) {
        if (!nodeData) {
            return null;
        }

        const li = document.createElement('li');
        li.classList.add('node', nodeData.level);

        const mobileElement = createMobileElement(nodeData);
        li.appendChild(mobileElement);

        if (nodeData.children && nodeData.children.length > 0) {
            const ul = document.createElement('ul');
            nodeData.children.forEach(childData => {
                const childNode = buildTree(childData);
                if (childNode) {
                    ul.appendChild(childNode);
                }
            });
            li.appendChild(ul);
        }

        return li;
    }

    async function initializeMobile() {
        const jsonFiles = ["cat.json", "cat2.json", "mono.json", "camel.json", "great_horned_owl.json", "greater_flamingo.json", "short_beaked_echidna.json"];
        
        const domainNodeData = {
            name: "Domain",
            level: "domain",
            children: [],
            frontImageUrl: "data/linnaeus.jpg",
            backImageUrl: "data/stuffed_linnaeus.jpeg"
        };

        const taxonomicLevels = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

        for (const filename of jsonFiles) {
            const data = await fetchData(filename);
            if (!data) continue;

            let currentNode = domainNodeData;
            const baseFilename = filename.split('.')[0];
            const imagePath = `data/${baseFilename}.jpg`;

            for (const level of taxonomicLevels) {
                if (!data[level]) break; 

                const nodeName = data[level];
                let childNode = currentNode.children.find(child => child.name === nodeName && child.level === level);

                if (!childNode) {
                    childNode = {
                        name: nodeName,
                        level: level,
                        children: []
                    };
                    currentNode.children.push(childNode);
                }
                currentNode = childNode;
            }
            
            currentNode.backImageUrl = imagePath;
        }

        const domainWrapper = document.createElement('li');
        domainWrapper.classList.add('node', 'domain');

        const domainMobileElement = createMobileElement(domainNodeData);
        domainWrapper.appendChild(domainMobileElement);

        if (domainNodeData.children.length > 0) {
            const ul = document.createElement('ul');
            domainNodeData.children.forEach(childData => {
                const childNode = buildTree(childData);
                if (childNode) {
                    ul.appendChild(childNode);
                }
            });
            domainWrapper.appendChild(ul);
        }

        if (mobileContainer) {
            mobileContainer.innerHTML = '';
            mobileContainer.appendChild(domainWrapper);
        } else {
            console.error('mobileContainer not found!');
        }
    }

    initializeMobile();
});
