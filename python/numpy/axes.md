For a 3D (or 2D, if we ignore the blue slice at the back which contains the values 2, 4, 6 and 8), the axes are defined as shown in figure below.

<img width="675" alt="Screenshot 2024-08-14 at 13 18 39" src="https://github.com/user-attachments/assets/38c1fd05-2ca7-4878-b202-7b419c87cbc9">

```python
import numpy as np

a = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
print(np.sum(a, axis=0))      # Prints [[ 6,  8],
                              #         [10, 12]]
print(np.sum(a, axis=1))      # Prints [[ 4,  6],
                              #         [12, 14]]
print(np.sum(a, axis=2))      # Prints [[ 3,  7],
                              #         [11, 15]]
```