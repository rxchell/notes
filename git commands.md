# Push from current branch

1. Add the files to staging
     - Add specfic file: `git add <file path>`
     - Add all files: `git add .`

2. Commit the files
     - `git commit -m <commit message`
     - `git commit`, write commit message, `:wq!`
  
3. Push the commit 
     - `git push`


# Sync current branch to main branch

1. `git fetch origin`
2. `git checkout main`
3. `git merge <current_branch>`
4. `git add .`
5. `git commit -m “merging “current_branch” branch into main”`
6. `git push origin main`

# Sync main branch to current branch

1. `git checkout <current_branch>`
2. `git fetch origin`
3. `git merge origin/main`
4. `git push origin <current_branch>`

# Pull from main in Github to current branch
1. `git pull origin main`

# Pull from main branch dev in Github (remote) to branch in VS Code (local)
1. `git config pull.rebase false`
2. `git pull origin dev`


