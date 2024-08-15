#### 1. Make virtual environment in directory. It is named env here.
```
python -m venv env
```
eg  
```
(base) rachel@Rachels-MacBook-Air AMGS-EEG % python -m venv env
```

#### 2. Activate the environment
```
source env/bin/activate
```
```
(base) rachel@Rachels-MacBook-Air AMGS-EEG % source env/bin/activate
```

#### 3. Check for packages and install
```
(env) (base) rachel@Rachels-MacBook-Air AMGS-EEG % pip show pylsl 
WARNING: Package(s) not found: pylsl
(env) (base) rachel@Rachels-MacBook-Air AMGS-EEG %  pip install pylsl==1.10.5
```

#### Others
Search for package 
```
ls | grep pylsl
```

