import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField ,Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import { getToken, getUser } from '../../util';
import './manageusers.scss'
import { FaEdit, FaLockOpen, FaTrash } from 'react-icons/fa';
import ServerMessage from '../../components/serverMessage/ServerMessage';
import Loading from "../../components/loading/Loading";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reinitialiseDialogOpen, setReinitialiseDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToReinitialise, setUserToReinitialise] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [dontTouchAdmin, setDontTouchAdmin] = useState(false)
  const [serverMessageKey, setServerMessageKey] = useState(0);
  const [serverMessage, setServerMessage] = useState(null);
  const [showDeleteService, setShowDeleteService] = useState(false);

  const getUsers = async () => {
    const res = await api.getUsers({
      headers: {
        Authorization: `Bearer ${getToken()}`,
        id: getUser()._id,
      }
    });
    const usersWithRole = res.data.map(user => ({ ...user, role: user.roles[0].name }));
    setUsers(usersWithRole)
  }

  const handleDelete = async (userToDelete) => {

    try {
      const res = await api.deleteUser(userToDelete._id, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        }
      });
      console.log("res : ", res)
      setServerMessage({ message: res.data.message, type: 'success' });
      setServerMessageKey(prev => prev + 1);

      setDeleteDialogOpen(false);
      getUsers();
    } catch (error) {
        const resolvedError =  error.response;
        setServerMessage({ message: resolvedError?.data?.message, type: 'error' });
        setServerMessageKey(prev => prev + 1);
        console.log(resolvedError?.data?.message)
    }
     
  }

  const handleReinitialise = async (userToReinitialise) => {
    try {
      const res = await api.reinitialiseUser(userToReinitialise._id, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setServerMessage({ message: res.data.message, type: "success" });
      setServerMessageKey((prev) => prev + 1);
      setReinitialiseDialogOpen(false);
      getUsers();
    } catch (error) {
      setServerMessage({
        message: error.response?.data?.message,
        type: "error",
      });
      setServerMessageKey((prev) => prev + 1);
    }
  };

  const handleEdit = async () => {

    console.log("userToEdit ", userToEdit);
    if (
      userToEdit.firstname === '' ||
      userToEdit.lastname === '' ||
      userToEdit.phone === '' ||
      userToEdit.email === '' ||
      userToEdit.role === ''
    ) {
      setServerMessage({ message: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
      return;
    }
    try {
      if(userToEdit.role === "admin" && getUser().roles[0].name !== "admin"){ //
        setDontTouchAdmin(true); 
        setInterval(()=>{
          setDontTouchAdmin(false);
        }, 3000);
      }else{
        const res = await api.updateUser(userToEdit, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            id: userToEdit._id,
          },
        });
        setEditDialogOpen(false);
        getUsers();
        setShowDeleteService(false);
        setServerMessage({ message: res.data.message, type: 'success' });
        setServerMessageKey(prev => prev + 1);
      }
    } catch (error) {
      // if user is not a customer and the user has a service, prompt the user to delete the role's service(s) before changing the user's role.
      if (error.response.status === 405) {
        setShowDeleteService(true);
      } else {
        const resolvedError = error.response;
        setServerMessage({
          message: resolvedError?.data?.message,
          type: "error",
        });
        setServerMessageKey((prev) => prev + 1);
        console.log(resolvedError?.data?.message);
      }
  };

  const deleteServices = async () => {
    setLoading(true);

    try {
      const res = await api.deleteAllServices({
        headers: {
          Authorization: `Bearer ${getToken()}`,
          id: userToEdit._id,
        },
      });

      setShowDeleteService(false);
      handleEdit();
      setServerMessage({ message: res.data.message, type: "success" });
      setServerMessageKey((prev) => prev + 1);
    } catch (error) {
      error.response?.data?.message
        ? setServerMessage({
            message: error?.response?.data?.message,
            type: "error",
          })
        : console.log(
            "Une erreur s'est produite lors de la suppression du service ",
            error
          );
    } finally {
      setLoading(false);
    }
      
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (

    <div  className='service-dashboard manage-users'>
      {serverMessage && (

               <ServerMessage
          message={serverMessage.message}
          type={serverMessage.type}
          key={serverMessageKey}
        />
      )}
      {showDeleteService && (
        <div className="alert alert-danger mt-3" role="alert">
          Vous ne pouvez pas modifier le rôle de cet utilisateur tant que vous
          n'avez pas supprimé ses services. Êtes-vous sur de vouloir continuer?
          <div>
            <Button onClick={() => setShowDeleteService(false)} color="primary">
              Annuler
            </Button>
            <Button onClick={() => deleteServices()} color="error">
              Continuer
            </Button>
          </div>
        </div>
      )}
      {loading && <Loading />}

      {
        <div style={{fontWeight:"bold", fontSize:"1rem", color:"red"}}>{dontTouchAdmin && "Impossible de modifier les informations de l'admin"}{" "} </div>
      }
      <table className="table">
        <thead>
          <tr className='title'>
            <th>ID</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className='text-table'>{user._id}</td>
              <td className='text-table'>{user.firstname}</td>
              <td className='text-table'>{user.lastname}</td>
              <td className='text-table'>{user.phone}</td>
              <td className='text-table'>{user.email}</td>
              <td className='text-table'>{user.role}</td>
              <td className=''>
                <span className='edit-icon ' onClick={() => {delete user.listservices; setUserToEdit(user); setEditDialogOpen(true); }}><FaEdit/> </span>
                <span className='delete-icon ' onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}><FaTrash /> </span>
                <span
                  className="edit-icon"
                  onClick={() => {
                    setUserToReinitialise(user);
                    setReinitialiseDialogOpen(true);
                  }}
                >
                  <FaLockOpen />{" "}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{"Supprimer l'utilisateur"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Non
          </Button>
          <Button onClick={() => {setDeleteDialogOpen(false);handleDelete(userToDelete
          );}} color="primary" autoFocus>
          Oui
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
        open={reinitialiseDialogOpen}
        onClose={() => setReinitialiseDialogOpen(false)}
      >
        <DialogTitle>
          Réinitialiser le mot de passe de l'utilisateur
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment réinitialiser le mot de passe de cet
            utilisateur?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReinitialiseDialogOpen(false)}
            color="primary"
          >
            Non
          </Button>
          <Button
            onClick={() => {
              handleReinitialise(userToReinitialise);
              setReinitialiseDialogOpen(false);
            }}
            color="primary"
            autoFocus
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

    <Dialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
    >
      <DialogTitle>{"Modifier l'utilisateur"}</DialogTitle>
      <DialogContent>
        {userToEdit && (
          <form>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Prénom"
              type="text"
              fullWidth
              value={userToEdit.firstname}
              onChange={event => setUserToEdit({ ...userToEdit, firstname: event.target.value })}
              required
              error={userToEdit.firstname === ''}
            />
            <TextField
              margin="dense"
              id="name"
              label="Nom de famille"
              type="text"
              fullWidth
              value={userToEdit.lastname}
              required
              error={userToEdit.lastname === ''}
              onChange={event => setUserToEdit({ ...userToEdit, lastname: event.target.value })}
              
            />
            <TextField
              margin="dense"
              id="name"
              label="Téléphone"
              type="text"
              fullWidth
              value={userToEdit.phone}
              required
              
            />
            <TextField
              margin="dense"
              id="name"
              label="Email"
              type="email"
              fullWidth
              value={userToEdit.email}
              required
              error={userToEdit.email === ''}
              onChange={event => setUserToEdit({ ...userToEdit, email: event.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel id="name-label">Role</InputLabel>
              <Select
                labelId="name-label"
                id="name"
                value={userToEdit.role}
                required
                error={userToEdit.role === ''}
                onChange={(event) => setUserToEdit({ ...userToEdit, role: event.target.value })}
                label="Role"
              >
                <MenuItem value="customer">customer</MenuItem>
                <MenuItem value="provider">provider</MenuItem>
                <MenuItem value="moderator">moderator</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </Select>
            </FormControl>
          </form>
        )}
      </DialogContent>
      <DialogActions>
      <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Annuler
      </Button>
      <Button onClick={() => {setEditDialogOpen(false);handleEdit();}}
            color="primary"
          >
            Sauvegarder
          </Button>
        </DialogActions>
      

    </Dialog>
  </div>
);
};
}
export default ManageUsers;
