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

    function createMobileElement(nodeData, imageUrl = null) {
        const mobileElement = document.createElement('div');
        mobileElement.classList.add('mobile-element');

        // Randomize rotation speed within 10% of 10 seconds (9s to 11s)
        const baseDuration = 10; // seconds
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const randomDuration = baseDuration * randomFactor;
        mobileElement.style.animationDuration = `${randomDuration}s`;

        const front = document.createElement('div');
        front.classList.add('front');
        const label = document.createElement('div');
        label.classList.add('label');
        label.textContent = nodeData.name;
        front.appendChild(label);
        mobileElement.appendChild(front);

        const back = document.createElement('div'); // Create back div unconditionally
        back.classList.add('back');

        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = nodeData.name;
            back.appendChild(img);
        } else {
            const pictureText = document.createElement('div');
            pictureText.classList.add('picture-text'); // Add a class for styling if needed
            pictureText.textContent = "picture";
            back.appendChild(pictureText);
        }
        mobileElement.appendChild(back); // Append back div unconditionally

        return mobileElement;
    }

    function buildTree(nodeData) {
        if (!nodeData) {
            return null;
        }

        const li = document.createElement('li');
        li.classList.add('node', nodeData.level);

        let imageUrl = null;
        if (nodeData.isBottomNode && nodeData.image) {
            imageUrl = nodeData.image;
        }

        const mobileElement = createMobileElement(nodeData, imageUrl);
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
        const jsonFiles = ['cat.json', 'cat2.json', 'mono.json']; // List of your JSON files
        const allNodes = {}; // To store all nodes by level and name for coalescing

        // Define the taxonomic levels in order
        const taxonomicLevels = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

        for (const filename of jsonFiles) {
            const data = await fetchData(filename);
            if (data) {
                let currentParent = allNodes; // Start from the root of our combined structure
                let lastNode = null; // To keep track of the deepest node in the current lineage

                // Extract the base name of the JSON file for image association
                const baseFilename = filename.split('.')[0];
                const imagePath = `data/${baseFilename}.jpg`;

                for (const level of taxonomicLevels) {
                    if (data[level]) {
                        const nodeName = data[level];
                        if (!currentParent[level]) {
                            currentParent[level] = {};
                        }
                        if (!currentParent[level][nodeName]) {
                            currentParent[level][nodeName] = {
                                name: nodeName,
                                level: level,
                                children: []
                            };
                        }

                        // Link the current node to the previous level's children
                        if (lastNode) {
                            // Check if this child already exists to avoid duplicates
                            if (!lastNode.children.some(child => child.name === nodeName && child.level === level)) {
                                lastNode.children.push(currentParent[level][nodeName]);
                            }
                        }
                        lastNode = currentParent[level][nodeName];
                    }
                }
                // Mark the last node of this lineage as a bottom node and assign the image
                if (lastNode) {
                    lastNode.isBottomNode = true;
                    lastNode.image = imagePath;
                }
            }
        }

        // Now, build the actual tree from the coalesced data
        const domainNodeData = {
            name: "Domain",
            level: "domain",
            children: []
        };

        // Populate the domain's children with the top-level nodes (kingdoms)
        if (allNodes.kingdom) {
            for (const kingdomName in allNodes.kingdom) {
                domainNodeData.children.push(allNodes.kingdom[kingdomName]);
            }
        }

        const domainWrapper = document.createElement('li');
        domainWrapper.classList.add('node', 'domain');

        const domainMobileElement = createMobileElement(domainNodeData);
        domainWrapper.appendChild(domainMobileElement);

        const ul = document.createElement('ul');
        domainNodeData.children.forEach(childData => {
            const childNode = buildTree(childData);
            if (childNode) {
                ul.appendChild(childNode);
            }
        });
        domainWrapper.appendChild(ul);

        if (mobileContainer) {
            mobileContainer.innerHTML = ''; // Clear existing content
            mobileContainer.appendChild(domainWrapper);
        } else {
            console.error('mobileContainer not found!');
        }
    }

    initializeMobile();
});
