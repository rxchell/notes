1. Make virtual environment in directory. It is named env here. 
```
(base) rachel@Rachels-MacBook-Air AMGS-EEG % python -m venv env
```

2. Activate the environment
```
(base) rachel@Rachels-MacBook-Air AMGS-EEG % source env/bin/activate
```

3. Check for packages and install
```
(env) (base) rachel@Rachels-MacBook-Air AMGS-EEG % pip show pylsl 
WARNING: Package(s) not found: pylsl
(env) (base) rachel@Rachels-MacBook-Air AMGS-EEG %  pip install pylsl==1.10.5
```
