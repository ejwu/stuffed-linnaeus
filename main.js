document.addEventListener('DOMContentLoaded', () => {
    const mobileContainer = document.querySelector('.mobile-container');
    let highlightedNode = null;

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

    function createInfobox() {
        const infobox = document.createElement('div');
        infobox.id = 'infobox';
        infobox.className = 'infobox';

        const closeButton = document.createElement('span');
        closeButton.id = 'infobox-close';
        closeButton.className = 'infobox-close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => {
            infobox.style.display = 'none';
            if (highlightedNode) {
                highlightedNode.classList.remove('highlighted');
                highlightedNode = null;
            }
            infobox.style.height = ''; // Reset height to default from CSS
            document.getElementById('infobox-content').style.flexDirection = ''; // Reset flex direction
        };

        const content = document.createElement('div');
        content.id = 'infobox-content';
        content.className = 'infobox-content';

        infobox.appendChild(closeButton);
        infobox.appendChild(content);
        document.body.appendChild(infobox);
    }

    function showInfobox(nodeData, element) {
        if (highlightedNode) {
            highlightedNode.classList.remove('highlighted');
        }
        highlightedNode = element;
        highlightedNode.classList.add('highlighted');

        const infobox = document.getElementById('infobox');
        const content = document.getElementById('infobox-content');
        content.innerHTML = ''; // Clear previous content

        if (nodeData.level === 'domain') {
            infobox.style.height = '900px';
            content.style.flexDirection = 'column'; // Stack content vertically

            // Create a container for the top part (1/3 height)
            const topPart = document.createElement('div');
            topPart.style.height = '33.33%';
            topPart.style.display = 'flex';

            // Create front item (for top part)
            const frontItem = document.createElement('div');
            frontItem.className = 'infobox-item';
            if (nodeData.frontImageUrl) {
                const img = document.createElement('img');
                img.src = nodeData.frontImageUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                frontItem.appendChild(img);
            } else {
                frontItem.style.display = 'flex';
                frontItem.style.flexDirection = 'column';
                frontItem.style.justifyContent = 'center';
                frontItem.style.alignItems = 'center';
                const label = document.createElement('div');
                label.textContent = nodeData.name;
                frontItem.appendChild(label);
            }
            topPart.appendChild(frontItem);

            // Create back item (for top part)
            const backItem = document.createElement('div');
            backItem.className = 'infobox-item';
            if (nodeData.backImageUrl) {
                const img = document.createElement('img');
                img.src = nodeData.backImageUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                backItem.appendChild(img);
            }
            topPart.appendChild(backItem);

            content.appendChild(topPart);

            // Create a container for the bottom part (2/3 height)
            const bottomPart = document.createElement('div');
            bottomPart.style.height = '66.67%';
            
            // Create the collage
            if (nodeData.descendantImages && nodeData.descendantImages.length > 0) {
                const collageGrid = document.createElement('div');
                collageGrid.className = 'collage-grid';
                collageGrid.style.height = '100%'; // Fill the bottom part
                const gridSize = Math.ceil(Math.sqrt(nodeData.descendantImages.length));
                const percentage = 100 / gridSize;
                collageGrid.style.gridTemplateColumns = `repeat(${gridSize}, ${percentage}%)`;
                collageGrid.style.gridTemplateRows = `repeat(${gridSize}, ${percentage}%)`;
                nodeData.descendantImages.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    collageGrid.appendChild(img);
                });
                bottomPart.appendChild(collageGrid);
            }
            
            content.appendChild(bottomPart);

        } else { // For all other nodes
            content.style.flexDirection = ''; // Reset to default (row)
            // Create front item
            const frontItem = document.createElement('div');
            frontItem.className = 'infobox-item';
            if (nodeData.frontImageUrl) {
                const img = document.createElement('img');
                img.src = nodeData.frontImageUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                frontItem.appendChild(img);
            } else {
                frontItem.style.display = 'flex';
                frontItem.style.flexDirection = 'column';
                frontItem.style.justifyContent = 'center';
                frontItem.style.alignItems = 'center';
                const label = document.createElement('div');
                if (nodeData.level === 'species' && nodeData.parent) {
                    label.textContent = `${nodeData.parent.name} ${nodeData.name}`;
                } else {
                    label.textContent = nodeData.name;
                }
                frontItem.appendChild(label);
                if (nodeData.backImageUrl && nodeData.level === 'species') {
                    const baseFilename = nodeData.backImageUrl.split('/').pop().split('.').slice(0, -1).join('.');
                    const filenameDiv = document.createElement('div');
                    filenameDiv.textContent = baseFilename;
                    filenameDiv.style.fontSize = '10px';
                    filenameDiv.style.color = '#888';
                    frontItem.appendChild(filenameDiv);
                }
            }

            // Create back item
            const backItem = document.createElement('div');
            backItem.className = 'infobox-item';
            if (nodeData.level !== 'domain' && nodeData.descendantImages && nodeData.descendantImages.length > 0) {
                const collageGrid = document.createElement('div');
                collageGrid.className = 'collage-grid';
                const percentage = 100 / nodeData.collageGridSize;
                collageGrid.style.gridTemplateColumns = `repeat(${nodeData.collageGridSize}, ${percentage}%)`;
                collageGrid.style.gridTemplateRows = `repeat(${nodeData.collageGridSize}, ${percentage}%)`;
                nodeData.descendantImages.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    collageGrid.appendChild(img);
                });
                backItem.appendChild(collageGrid);
            } else if (nodeData.backImageUrl) {
                const img = document.createElement('img');
                img.src = nodeData.backImageUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                backItem.appendChild(img);
            } else {
                backItem.style.display = 'flex';
                backItem.style.justifyContent = 'center';
                backItem.style.alignItems = 'center';
                backItem.textContent = 'picture';
            }

            content.appendChild(frontItem);
            content.appendChild(backItem);
        }

        infobox.style.display = 'block';
    }

    function createMobileElement(nodeData) {
        const mobileElement = document.createElement('div');
        mobileElement.classList.add('mobile-element');

        const charCount = nodeData.name.length;
        const estimatedWidth = charCount * 8 + 40;
        const finalWidth = Math.max(100, estimatedWidth);
        mobileElement.style.width = `${finalWidth}px`;

        const randomDuration = (9 + Math.random() * 2);
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

        if (nodeData.level !== 'domain' && nodeData.descendantImages && nodeData.descendantImages.length > 0) {
            const collageGrid = document.createElement('div');
            collageGrid.className = 'collage-grid';
            const percentage = 100 / nodeData.collageGridSize;
            collageGrid.style.gridTemplateColumns = `repeat(${nodeData.collageGridSize}, ${percentage}%)`;
            collageGrid.style.gridTemplateRows = `repeat(${nodeData.collageGridSize}, ${percentage}%)`;
            nodeData.descendantImages.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                collageGrid.appendChild(img);
            });
            back.appendChild(collageGrid);
        } else if (nodeData.backImageUrl) {
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

        mobileElement.addEventListener('click', () => showInfobox(nodeData, mobileElement));

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

    function collectAndAssignDescendantImages(nodeData) {
        if (!nodeData) return [];

        let images = [];
        if (nodeData.level === 'species' && nodeData.backImageUrl) {
            images.push(nodeData.backImageUrl);
        }

        if (nodeData.children && nodeData.children.length > 0) {
            nodeData.children.forEach(child => {
                images = images.concat(collectAndAssignDescendantImages(child));
            });
        }

        if (nodeData.level !== 'species') {
            nodeData.descendantImages = images;
            if (images.length > 0) {
                nodeData.collageGridSize = Math.ceil(Math.sqrt(images.length));
            }
        }

        return images;
    }

    async function initializeMobile() {
        createInfobox(); // Create the infobox structure on startup

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
                        children: [],
                        parent: currentNode
                    };
                    currentNode.children.push(childNode);
                }
                currentNode = childNode;
            }
            
            currentNode.backImageUrl = imagePath;
        }

        collectAndAssignDescendantImages(domainNodeData);

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
