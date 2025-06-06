# Push from current branch
1. Add the files to staging
     - Add specfic file: `git add <file path>`
     - Add all files: `git add .`
2. Commit the files
     - `git commit -m <commit message`
     - `git commit`, write commit message, `:wq!`
3. Push the commit 
     - `git push`

# Pull Request
E.g. Merging from current branch (dev) to target branch (staging)
1. Ensure you are on the branch that you want to create a PR from
     - `git checkout <current_branch>` 
2. **Pull from target branch (remote) to current branch (locally)**
     - `git pull origin <target_branch>` (Eg `git pull origin staging`)
     - `git fetch origin` and `git merge origin/<target_branch>`
3. Push the current branch which is now up to date with the remote target branch
     - `git push origin <current_branch>`
4. Create PR from current branch to target branch 

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

# Resolving merge conflicts of current branch (outdated) with target branch
- Can occur when you don't pull from target branch before merging current branch to it
- Example below: `dev` branch has merge conflicts with `staging` branch when you want to create a PR to it

1. Create a copy of current branch to test on
     - `git checkout -b <current_branch_rebased> <current_branch>`
     - E.g. `git checkout -b dev_rebased dev`
2. Ensure latest target branch
     - `git fetch origin`
3. **Rebase** branch (clone branch to be rebased) with target branch 
     - `git rebase origin/<target_branch>`
     - E.g. `git rebase origin/staging`
4. Rebasing process
     - Resolve conflicts
     - `git add .`
     - `git rebase --continue`
     - NOTE: Can **skip revert commits** with `git rebase --skip`
5. Now rebased branch (`dev_rebased`) will have
     - All commits from target branch (`staging`)
     - All additional changes from current branch (`dev`)
6. Merge rebased branch (`dev_rebased`) with target branch (`staging`)
     - Create a PR from rebased branch (`dev_rebased`) to target branch (`staging`)
7. Reset original unrebased branch (`dev`) to rebased version (`staging`)
     - NOTE: Do not pull rebased version (`dev_rebased` or `staging`) into a pre-rebased branch (`dev`)
     - Assuming `dev_rebased` is clean and already merged to `staging`, we can now safely point `dev` to match that history:
     - `git checkout <current_branch>` (E.g. `git checkout dev`)
     - `git reset -hard origin/<target_branch>` (E.g. `git reset --hard origin/staging`)
     - `git push --force` to push to remote
