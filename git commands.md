# push from current branch
git add -A

git commit 

git push

write commit message 

:wq! 


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
