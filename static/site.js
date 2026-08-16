const repo = 'lordhck/repo';

const version = document.getElementById('version');
const copyButton = document.querySelector('.copy-btn');
const installCommand = document.getElementById('install-command');

fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
    headers: {
        Accept: 'application/vnd.github+json'
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch latest commit');
        }

        return response.json();
    })
    .then(commits => {
        if (!commits.length) {
            throw new Error('No commits found');
        }

        const commit = commits[0];
        const hash = commit.sha.substring(0, 7);

        version.textContent = hash;
        version.href = commit.html_url;
    })
    .catch(() => {
        version.textContent = 'unknown';
        version.removeAttribute('href');
    });

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(installCommand.textContent)
        .then(() => {
            copyButton.textContent = 'Copied!';

            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 1500);
        })
        .catch(() => {
            copyButton.textContent = 'Failed';

            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 1500);
        });
});
