# push from current branch
git add -A

git commit 

write commit message 

:wq! 

git push


# syncing current branch to main branch

git fetch origin

git checkout main

git merge your_branch

git add .

git commit -m “merging “your_branch” branch into main”

git push origin main

# Syncing main branch to current branch

git checkout your_branch_name

git fetch origin

git merge origin/main

git push origin your_branch_name

# Pull from main branch dev in Github to branch in VS Code

git config pull.rebase false

git pull origin dev
