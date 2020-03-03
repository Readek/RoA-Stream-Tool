#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

public:
    void onButtonClicked();

private slots:
    void on_comboBox_currentIndexChanged(const QString &arg1);

    void on_comboBox_4_currentIndexChanged(const QString &arg1);

    void on_pushButton_5_clicked();

    void on_CheckWinP1_1_clicked();

    void on_CheckWinP1_2_clicked();

    void on_CheckWinP1_3_clicked();

    void on_CheckWinP2_1_clicked();

    void on_CheckWinP2_2_clicked();

    void on_CheckWinP2_3_clicked();

    void on_radioButton_clicked();

    void on_radioButton_2_clicked();

    void on_lineEdit_3_textChanged(const QString &arg1);

    void on_checkLP1_clicked();

    void on_checkWP1_clicked();

    void on_checkWP2_clicked();

    void on_checkLP2_clicked();

    void on_buttonUpdate_clicked();

    void updateP1();

    void updateP2();

    void updateRound();

    void updateCasters();

    void on_lineEdit_textChanged(const QString &arg1);

    void on_lineEdit_2_textChanged(const QString &arg1);

private:
    Ui::MainWindow *ui;
    void loadTextFile();
};

#endif // MAINWINDOW_H
